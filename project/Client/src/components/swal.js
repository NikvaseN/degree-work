import Swal from "sweetalert2";

// Использование:
// Toast.fire({
// 	icon: "success",
// 	title: "Signed in successfully"
// });

export const Toast = Swal.mixin({
	toast: true,
	position: "top-end",
	showConfirmButton: false,
	timer: 2000,
	timerProgressBar: true,
	didOpen: (toast) => {
	  toast.onmouseenter = Swal.stopTimer;
	  toast.onmouseleave = Swal.resumeTimer;
	}
});