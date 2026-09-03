import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Linking,
  Image,
} from "react-native";
import {
  Camera as VisionCamera,
  useCameraDevice,
  useFrameProcessor,
  VisionCameraProxy,
} from "react-native-vision-camera";
import type {
  Face,
  FaceDetectionOptions,
} from "react-native-vision-camera-face-detector";
import { Worklets } from "react-native-worklets-core";
import Svg, { Ellipse, Mask, Rect } from "react-native-svg";
import { CloseCircle, TickCircle } from "iconsax-react-nativejs";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { captureAndCompress } from "../utlis/imageCapture";
import { AppText } from "./AppText";
import { useColors } from "../hooks/useTheme";

const { width, height } = Dimensions.get("window");

// The captured photo is never shown while the challenge is in progress —
// only a description of what to do (align/blink/turn). Once blink + turn
// both pass, the photo appears on a review screen where the user decides
// to submit ("Looks Good") or start over ("Retake") — nothing is sent to
// the backend automatically.
type LivenessStep =
  | "permission"
  | "position"
  | "capturing"
  | "blink"
  | "turn"
  | "success"
  | "failed";

// Eyes must dip below this to count as "closed", then climb back above this
// to count as "open again". The gap between the two (hysteresis) stops a
// single noisy frame from registering as a blink on its own.
const EYES_CLOSED_THRESHOLD = 0.4;
const EYES_OPEN_THRESHOLD = 0.6;
// A hand (or anything else) briefly covering the eyes reads to the face
// detector exactly like "eyes closed": leftEyeOpenProbability/
// rightEyeOpenProbability drop because the landmarks are hidden, not
// because the eyes actually shut. A real blink is fast (100-400ms); a hand
// moving up, covering, and moving away again is not. Bounding how long the
// "closed" reading is allowed to last before it must reopen rejects that
// without punishing a genuine, even deliberately slow, blink.
const MAX_BLINK_DURATION_MS = 1000;
const YAW_TURN_THRESHOLD = 18; // degrees off-center to count as "turned"
const YAW_CENTER_THRESHOLD = 10; // degrees to count as "back to center"
// Same idea as MAX_BLINK_DURATION_MS — a real head turn-and-back reads as
// a smooth, bounded motion; an object waved in front of the camera to
// spoof the yaw angle doesn't need to be nearly this patient.
const MAX_TURN_DURATION_MS = 3500;
// How far the face's center may drift from the frame's center, as a
// fraction of the frame's own dimensions, before it no longer counts as
// "well positioned". Smaller = stricter alignment required.
const CENTER_TOLERANCE = 0.18;
// How long the face has to stay correctly sized AND centered before the
// photo auto-captures — long enough for the camera's auto-exposure/focus
// to settle and for the position to be a deliberate hold, not a pass-through.
const POSITION_STABLE_MS = 900;
const STEP_TIMEOUT_MS = 12000;
const FRAME_SAMPLE_MS = 100; // ~10fps is plenty for these thresholds
const CAPTURE_TIMEOUT_MS = 5000;
const MAX_CAPTURE_ATTEMPTS = 3;

const faceDetectionOptions: FaceDetectionOptions = {
  performanceMode: "fast",
  classificationMode: "all", // needed for eyes-open probabilities
  landmarkMode: "none",
  contourMode: "none",
  trackingEnabled: true,
  minFaceSize: 0.2,
};

type Props = {
  // LivenessCheck now owns the capture. It hands back the final base64
  // image — taken automatically the moment the face is aligned, before the
  // blink/turn challenge even starts — rather than a bare "you passed"
  // signal. If the challenge isn't completed, onSuccess is never called and
  // no request is made.
  onSuccess: (base64Image: string) => void;
  onCancel: () => void;
};

class LivenessErrorBoundary extends React.Component<
  { onCancel: () => void; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("LivenessCheck failed to initialize:", error);
  }

  retry = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <LivenessCheckError
          onRetry={this.retry}
          onCancel={this.props.onCancel}
        />
      );
    }
    return this.props.children;
  }
}

function LivenessCheckError({
  onRetry,
  onCancel,
}: {
  onRetry: () => void;
  onCancel: () => void;
}) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centeredContent}>
        <AppText style={styles.statusTitle}>Liveness Check Unavailable</AppText>
        <AppText style={styles.statusSubtitle}>
          Something went wrong starting the camera check. Please try again.
        </AppText>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={onRetry}>
          <AppText style={styles.primaryButtonText}>Try Again</AppText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
          <AppText style={styles.secondaryButtonText}>Cancel</AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function LivenessCheck({ onSuccess, onCancel }: Props) {
  return (
    <LivenessErrorBoundary onCancel={onCancel}>
      <LivenessCheckInner onSuccess={onSuccess} onCancel={onCancel} />
    </LivenessErrorBoundary>
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Capture timed out")), ms),
    ),
  ]);
}

// A short, active challenge run on the live front camera — align your
// face (auto-captured the instant you're aligned), blink, then turn your
// head. The captured photo is the only image ever sent to the backend; the
// challenge just gates whether that photo is allowed to be submitted.
function LivenessCheckInner({ onSuccess, onCancel }: Props) {
  const device = useCameraDevice("front");
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const cameraRef = useRef<VisionCamera>(null);

  // Call the native "detectFaces" plugin directly rather than through the
  // package's useFaceDetector() hook — that hook wraps plugin.call() in its
  // own 'worklet' function, and capturing one worklet-decorated closure
  // inside another worklet's closure is what was crashing native JSI
  // compilation on-device ("invalid empty parentheses"). `plugin` here is a
  // native HostObject, not a JS worklet, so it carries no such metadata and
  // is safe to capture inside our single frame-processor worklet below.
  const facePlugin = useMemo(() => {
    const plugin = VisionCameraProxy.initFrameProcessorPlugin("detectFaces", {
      ...faceDetectionOptions,
    });
    if (!plugin) {
      throw new Error('Failed to load Frame Processor Plugin "detectFaces"!');
    }
    return plugin;
  }, []);

  const [step, setStep] = useState<LivenessStep>("permission");
  const [permissionDenied, setPermissionDenied] = useState(false);

  // The captured photo itself never touches component state — it's held
  // only as a ref, since it's never rendered anywhere, just handed to
  // onSuccess once the challenge passes.
  const capturedBase64Ref = useRef<string | null>(null);
  const captureAttemptsRef = useRef(0);
  const isCapturingRef = useRef(false);

  const eyesClosedRef = useRef(false);
  const eyesClosedAtRef = useRef<number | null>(null);
  const blinkDetectedRef = useRef(false);
  const positionSinceRef = useRef<number | null>(null);
  const turnedRef = useRef(false);
  const turnedAtRef = useRef<number | null>(null);
  const lastProcessedAtRef = useRef(0);

  const stepRef = useRef(step);
  stepRef.current = step;

  const timeoutHandleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearStepTimeout = useCallback(() => {
    if (timeoutHandleRef.current) {
      clearTimeout(timeoutHandleRef.current);
      timeoutHandleRef.current = null;
    }
  }, []);

  const armStepTimeout = useCallback(() => {
    clearStepTimeout();
    timeoutHandleRef.current = setTimeout(() => {
      setStep("failed");
    }, STEP_TIMEOUT_MS);
  }, [clearStepTimeout]);

  // Camera permission was already granted on the previous (SelfieVerification)
  // screen in the normal flow, but re-check in case it was revoked in the
  // background — never assume access.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const currentStatus = VisionCamera.getCameraPermissionStatus();
      let status = currentStatus;
      if (currentStatus !== "granted" && currentStatus !== "denied") {
        status = await VisionCamera.requestCameraPermission();
      }
      if (cancelled) return;
      if (status === "granted") {
        setStep("position");
      } else {
        setPermissionDenied(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Timeout only applies to steps where the user has something to actively
  // do (align, blink, turn). Capturing/success/failed are either momentary
  // or driven by an explicit button.
  useEffect(() => {
    if (step === "position" || step === "blink" || step === "turn") {
      armStepTimeout();
    } else {
      clearStepTimeout();
    }
    return clearStepTimeout;
  }, [step, armStepTimeout, clearStepTimeout]);

  const resetChallengeState = useCallback(() => {
    eyesClosedRef.current = false;
    eyesClosedAtRef.current = null;
    blinkDetectedRef.current = false;
    positionSinceRef.current = null;
    turnedRef.current = false;
    turnedAtRef.current = null;
  }, []);

  // Auto-capture — fires the instant the face has been centered and stable
  // for POSITION_STABLE_MS, with no shutter button involved. This photo,
  // compressed the same way the old manual-capture screen did (so we never
  // upload an unbounded multi-MB image), is the only one that ever reaches
  // the backend — and it's never shown on screen, before or after.
  const triggerCapture = useCallback(async () => {
    if (isCapturingRef.current || !cameraRef.current) return;
    isCapturingRef.current = true;
    setStep("capturing");

    try {
      const photo = await withTimeout(
        cameraRef.current.takePhoto({
          flash: "off",
          enableShutterSound: false,
        }),
        CAPTURE_TIMEOUT_MS,
      );
      const { base64 } = await captureAndCompress(photo.path);
      capturedBase64Ref.current = base64;
      captureAttemptsRef.current = 0;
      resetChallengeState();
      setStep("blink");
    } catch (error) {
      console.error("Liveness auto-capture failed:", error);
      captureAttemptsRef.current += 1;
      if (captureAttemptsRef.current >= MAX_CAPTURE_ATTEMPTS) {
        setStep("failed");
      } else {
        positionSinceRef.current = null;
        setStep("position");
      }
    } finally {
      isCapturingRef.current = false;
    }
  }, [resetChallengeState]);

  const handleRetry = useCallback(() => {
    capturedBase64Ref.current = null;
    captureAttemptsRef.current = 0;
    resetChallengeState();
    setStep("position");
  }, [resetChallengeState]);

  // The user decides when to actually submit — "Looks good" on the success
  // screen is the real trigger, not a timer. "Retake" reuses handleRetry:
  // a new photo needs its own liveness proof, so the whole challenge (not
  // just the capture) starts over.
  const handleLooksGood = useCallback(() => {
    if (capturedBase64Ref.current) {
      onSuccess(capturedBase64Ref.current);
    } else {
      // Shouldn't happen — "success" is only reachable after a successful
      // capture — but never silently proceed without an image to send.
      setStep("failed");
    }
  }, [onSuccess]);

  const handleFacesDetection = useCallback(
    (faces: Face[], frameWidth: number, frameHeight: number) => {
      const currentStep = stepRef.current;
      if (
        currentStep !== "position" &&
        currentStep !== "blink" &&
        currentStep !== "turn"
      ) {
        return;
      }

      const now = Date.now();
      if (now - lastProcessedAtRef.current < FRAME_SAMPLE_MS) return;
      lastProcessedAtRef.current = now;

      if (faces.length !== 1) {
        // No face, or more than one in frame.
        if (currentStep === "position") {
          // Just waiting for alignment to begin with — reset stability
          // and keep watching.
          positionSinceRef.current = null;
          return;
        }
        // Something (a hand, an object) has fully blocked or confused the
        // detector mid-challenge. Previously this was silently ignored,
        // which combined with the "eyes closed" reading a hand produces
        // (see below) meant covering the camera and uncovering it could
        // slip past the blink/turn checks without the user ever actually
        // blinking or turning their head. Treat total face loss here the
        // same as losing centering: the whole challenge restarts.
        setStep("position");
        return;
      }

      const face = faces[0];
      // face.bounds comes from the native plugin's own coordinate space,
      // which is NOT simply frame.width x frame.height — its native code
      // explicitly swaps width/height before computing bounds ("frame is
      // always -90deg rotated"), so bounds.x/width actually span
      // [0, frame.height] and bounds.y/height span [0, frame.width]. Using
      // frame.width to normalize the x-axis (or frame.height for y) silently
      // produces nonsense offsets — that's what broke auto-capture entirely
      // last time. The swapped denominators below are the actual fix.
      const boundsSpaceWidth = frameHeight;
      const boundsSpaceHeight = frameWidth;

      const relativeSize = face.bounds.width / boundsSpaceWidth;
      const isRightSize = relativeSize > 0.35 && relativeSize < 0.85;

      // Right size alone doesn't mean centered — a face can be correctly
      // sized but off to one side. Check the face's own center against the
      // center of its own (swapped) coordinate space.
      const faceCenterX = face.bounds.x + face.bounds.width / 2;
      const faceCenterY = face.bounds.y + face.bounds.height / 2;
      const offCenterX =
        Math.abs(faceCenterX - boundsSpaceWidth / 2) / boundsSpaceWidth;
      const offCenterY =
        Math.abs(faceCenterY - boundsSpaceHeight / 2) / boundsSpaceHeight;
      const isWellPositioned =
        offCenterX < CENTER_TOLERANCE && offCenterY < CENTER_TOLERANCE;

      const isCentered = isRightSize && isWellPositioned;

      if (currentStep === "position") {
        if (!isCentered) {
          positionSinceRef.current = null;
          return;
        }
        if (positionSinceRef.current === null) {
          positionSinceRef.current = now;
          return;
        }
        if (now - positionSinceRef.current >= POSITION_STABLE_MS) {
          clearStepTimeout();
          positionSinceRef.current = null;
          triggerCapture();
        }
        return;
      }

      if (!isCentered) {
        // Lost the face mid-challenge — restart from positioning. The photo
        // already taken stays valid; only the live challenge restarts.
        setStep("position");
        return;
      }

      if (currentStep === "blink") {
        const eyesOpenScore = Math.min(
          face.leftEyeOpenProbability ?? 1,
          face.rightEyeOpenProbability ?? 1,
        );

        if (
          eyesClosedRef.current &&
          eyesClosedAtRef.current !== null &&
          now - eyesClosedAtRef.current > MAX_BLINK_DURATION_MS
        ) {
          // Eyes have read as "closed" for too long to be a blink — most
          // likely something is occluding them (a hand, an object) rather
          // than an actual blink in progress. Drop this attempt and go
          // back to watching for a fresh, properly-timed one instead of
          // letting a slow cover-and-uncover motion eventually satisfy it.
          eyesClosedRef.current = false;
          eyesClosedAtRef.current = null;
        }

        if (!eyesClosedRef.current && eyesOpenScore < EYES_CLOSED_THRESHOLD) {
          eyesClosedRef.current = true;
          eyesClosedAtRef.current = now;
        } else if (
          eyesClosedRef.current &&
          eyesOpenScore > EYES_OPEN_THRESHOLD
        ) {
          blinkDetectedRef.current = true;
        }

        if (blinkDetectedRef.current) {
          turnedRef.current = false;
          turnedAtRef.current = null;
          setStep("turn");
        }
        return;
      }

      if (currentStep === "turn") {
        const yaw = face.yawAngle ?? 0;

        if (
          turnedRef.current &&
          turnedAtRef.current !== null &&
          now - turnedAtRef.current > MAX_TURN_DURATION_MS
        ) {
          // Took too long to return to center after "turning" — same
          // reasoning as the blink timeout: a plausible head turn is a
          // single smooth motion, not an indefinitely held pose. Require
          // a fresh, properly-timed turn instead.
          turnedRef.current = false;
          turnedAtRef.current = null;
        }

        if (!turnedRef.current && Math.abs(yaw) > YAW_TURN_THRESHOLD) {
          turnedRef.current = true;
          turnedAtRef.current = now;
          return;
        }
        if (turnedRef.current && Math.abs(yaw) < YAW_CENTER_THRESHOLD) {
          // Challenge fully passed — hand the decision to the user instead
          // of auto-submitting. onSuccess only fires once they explicitly
          // tap "Looks good" (handleLooksGood).
          clearStepTimeout();
          setStep("success");
        }
      }
    },
    [clearStepTimeout, triggerCapture],
  );

  // Hops the detected faces back from the frame-processor worklet thread to
  // the JS thread. Kept as one plain worklet (rather than the package's
  // wrapped <Camera> convenience component, which chains several nested
  // worklets internally) — that wrapper was crashing on-device with a native
  // JSI compile failure, so we do the minimal, single-worklet version here.
  const runOnJs = useMemo(
    () => Worklets.createRunOnJS(handleFacesDetection),
    [handleFacesDetection],
  );

  const frameProcessor = useFrameProcessor(
    frame => {
      "worklet";
      const faces = facePlugin.call(frame) as unknown as Face[];
      runOnJs(faces, frame.width, frame.height);
    },
    [facePlugin, runOnJs],
  );

  if (permissionDenied) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContent}>
          <CloseCircle size={40} color={colors.error} variant="Bold" />
          <AppText style={styles.statusTitle}>Camera Permission Needed</AppText>
          <AppText style={styles.statusSubtitle}>
            We need camera access to confirm you're really here before
            submitting your verification.
          </AppText>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => Linking.openSettings()}
          >
            <AppText style={styles.primaryButtonText}>Open Settings</AppText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
            <AppText style={styles.secondaryButtonText}>Cancel</AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (step === "failed") {
    return (
      <SafeAreaView edges={["bottom", "top"]} style={styles.container}>
        <View style={styles.centeredContent}>
          <CloseCircle size={44} color={colors.error} variant="Bold" />
          <AppText style={styles.statusTitle}>Verification Failed</AppText>
          <AppText style={styles.statusSubtitle}>
            We couldn't confirm it's you. Make sure you're in a well-lit area,
            your whole face is visible, and try again.
          </AppText>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleRetry}>
            <AppText style={styles.primaryButtonText}>Try Again</AppText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
            <AppText style={styles.secondaryButtonText}>Cancel</AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!device || step === "permission") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContent}>
          <AppText style={styles.statusSubtitle}>
            Preparing liveness check…
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  // Blink + turn both passed on-device — that's liveness, not identity
  // verification — the backend still has to check the photo against the
  // BVN record, so this screen deliberately never claims "Verified"; that
  // word is only earned once the API call in SelfieConfirmation actually
  // succeeds. Submission itself is user-triggered here ("Looks good"), not
  // automatic — onSuccess only fires from handleLooksGood.
  if (step === "success") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContent}>
          {capturedBase64Ref.current && (
            <View style={styles.successImageFrame}>
              <Image
                source={{
                  uri: `data:image/jpeg;base64,${capturedBase64Ref.current}`,
                }}
                style={styles.successImage}
                resizeMode="cover"
              />
              <View style={styles.successImageBadge}>
                <TickCircle size={22} color={colors.success} variant="Bold" />
              </View>
            </View>
          )}
          <AppText style={styles.successTitle}>Liveness Check Passed</AppText>
          <AppText style={styles.successSubtitle}>
            This photo will also be used as your profile picture once
            verification is complete.
          </AppText>
        </View>
        {/* <AppText style={styles.disclaimer}>
          This photo will also be used as your profile picture once verification
          is complete.
        </AppText> */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLooksGood}
          >
            <AppText style={styles.primaryButtonText}>Looks Good</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleRetry}
          >
            <AppText style={styles.secondaryButtonText}>Retake</AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const bannerCopy: Partial<
    Record<LivenessStep, { primary: string; secondary?: string }>
  > = {
    position: {
      primary: "Align your face within the outline",
      secondary: "Keep a neutral expression",
    },
    capturing: {
      primary: "Hold still…",
    },
    blink: {
      primary: "Blink your eyes",
    },
    turn: {
      primary: "Turn your head to the side",
      secondary: "Then look forward again",
    },
  };

  const banner = bannerCopy[step] ?? bannerCopy.position!;
  const isAligning = step === "position" || step === "capturing";
  const ringColor = isAligning ? colors.error : colors.primary;
  const ovalCx = width / 2;
  const ovalCy = height * 0.38;
  const ovalRx = width * 0.32;
  const ovalRy = height * 0.22;
  // Ramanujan's ellipse-circumference approximation — used to turn the
  // oval outline into a "filling up" progress ring across blink/turn,
  // similar to the reference design's partial ring.
  const ovalCircumference =
    Math.PI *
    (3 * (ovalRx + ovalRy) -
      Math.sqrt((3 * ovalRx + ovalRy) * (ovalRx + 3 * ovalRy)));
  const stepProgress: Partial<Record<LivenessStep, number>> = {
    blink: 0.55,
    turn: 0.9,
  };
  const progress = stepProgress[step] ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraFrame}>
        <VisionCamera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          photo={true}
          pixelFormat="yuv"
          // Favors accurate auto-exposure/auto-focus over capture speed,
          // so the captured photo is well-lit and sharp rather than
          // whatever the camera happened to have settled on.
          photoQualityBalance="quality"
        />
      </View>

      {/* Fully hide everything outside the oval with the theme's own
          background — not just a dark dim — so only the outline itself
          ever shows the live camera. A semi-transparent overlay would let
          the camera bleed through at the corners of the rounded-rect
          preview box behind it; an opaque fill in the theme's background
          color covers that completely. */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Mask id="liveness-mask">
          <Rect width={width} height={height} fill="white" />
          <Ellipse
            cx={ovalCx}
            cy={ovalCy}
            rx={ovalRx}
            ry={ovalRy}
            fill="black"
          />
        </Mask>
        <Rect
          width={width}
          height={height}
          fill={colors.background}
          mask="url(#liveness-mask)"
        />
        <Ellipse
          cx={ovalCx}
          cy={ovalCy}
          rx={ovalRx}
          ry={ovalRy}
          stroke={ringColor}
          strokeWidth={4}
          strokeDasharray={isAligning ? "10,8" : ovalCircumference}
          strokeDashoffset={
            isAligning ? undefined : ovalCircumference * (1 - progress)
          }
          fill="transparent"
        />
      </Svg>

      <View style={styles.bannerContainer}>
        <AppText style={styles.bannerPrimary}>{banner.primary}</AppText>
        {banner.secondary && (
          <AppText style={styles.bannerSecondary}>{banner.secondary}</AppText>
        )}
      </View>

      <View style={styles.footer}>
        {/* <View style={styles.soundHint}>
          <VolumeHigh size={14} color={colors.textMuted} variant="Bold" />
          <AppText style={styles.soundHintText}>
            Turn on sound to hear voice instructions
          </AppText>
        </View> */}
        <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
          <AppText style={styles.secondaryButtonText}>Cancel</AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    cameraFrame: {
      position: "absolute",
      top: height * 0.16,
      left: width * 0.18,
      width: width * 0.64,
      height: height * 0.44,
      overflow: "hidden",
      borderRadius: Math.min(width * 0.32, height * 0.22),
      backgroundColor: colors.background,
    },
    // Centers within the space above the footer, not the whole screen —
    // plain flex centering here would put the content below true center,
    // since the eye reads "center" relative to the visible area above the
    // absolutely-positioned buttons, not the full container height.
    centeredContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
      paddingBottom: 170,
    },
    statusTitle: {
      color: colors.text,
      fontSize: normalize(19),
      fontFamily: getFontFamily("800"),
      marginTop: 16,
      marginBottom: 8,
      textAlign: "center",
    },
    statusSubtitle: {
      color: colors.textMuted,
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      textAlign: "center",
      lineHeight: 22,
    },
    bannerContainer: {
      position: "absolute",
      top: height * 0.06,
      alignSelf: "center",
      maxWidth: width - 56,
      gap: 4,
      backgroundColor: "rgba(0,0,0,0.6)",
      borderRadius: 24,
      paddingVertical: 16,
      paddingHorizontal: 22,
    },
    bannerPrimary: {
      color: "#FFFFFF",
      fontSize: normalize(20),
      fontFamily: getFontFamily("700"),
      textAlign: "center",
    },
    bannerSecondary: {
      color: "rgba(255,255,255,0.8)",
      fontSize: normalize(15),
      fontFamily: getFontFamily("400"),
      textAlign: "center",
    },
    // Sits a bit higher than flush with the bottom edge, leaving breathing
    // room below the buttons instead of crowding the screen's bottom.
    footer: {
      position: "absolute",
      bottom: 64,
      width: "100%",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    soundHint: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 16,
    },
    soundHintText: {
      color: colors.textMuted,
      fontSize: normalize(12),
      fontFamily: getFontFamily("400"),
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 120,
      alignItems: "center",
      width: "100%",
      marginBottom: 12,
    },
    primaryButtonText: {
      color: "#fff",
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
    },
    secondaryButton: {
      paddingVertical: 16,
      alignItems: "center",
      width: "100%",
      backgroundColor: colors.inputBackground,
      borderRadius: 120,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
    },
    successContent: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
    },
    successImageFrame: {
      width: 200,
      height: 200,
      borderRadius: 7,
      borderWidth: 3,
      borderColor: colors.success,
      padding: 3,
      marginTop: -200,
    },
    successImage: {
      width: "100%",
      height: "100%",
      borderRadius: 7,
    },
    successImageBadge: {
      position: "absolute",
      right: -2,
      bottom: -2,
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 2,
    },
    successTitle: {
      color: colors.text,
      fontSize: normalize(24),
      fontFamily: getFontFamily("800"),
      marginTop: 20,
      marginBottom: 8,
      textAlign: "center",
    },
    successSubtitle: {
      color: colors.text,
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      textAlign: "center",
      lineHeight: 20,
    },
    disclaimer: {
      color: colors.text,
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      textAlign: "center",
      lineHeight: 18,
      paddingHorizontal: 32,
      paddingBottom: 160,
      marginBottom: 80,
    },
  });
