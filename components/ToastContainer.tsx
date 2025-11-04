// import React, { useEffect, useState } from "react";
// import Toast from "./Toast";
// import { onToast } from "../utlis/toast";

// const ToastContainer: React.FC = () => {
//   const [toast, setToast] = useState<{
//     message: string;
//     type?: "success" | "error";
//     visible: boolean;
//   }>({
//     message: "",
//     type: "success",
//     visible: false,
//   });

//   useEffect(() => {
//     const unsubscribe = onToast(({ message, type }) => {
//       setToast({ message, type, visible: true });
//     });

//     return unsubscribe;
//   }, []);

//   return (
//     <Toast
//       message={toast.message}
//       type={toast.type}
//       visible={toast.visible}
//       onHide={() => setToast(prev => ({ ...prev, visible: false }))}
//     />
//   );
// };

// export default ToastContainer;
