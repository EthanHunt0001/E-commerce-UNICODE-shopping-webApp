const fileInput = document.getElementById('file-input');
const proImg = document.getElementById('profileImg');
const saveBtn = document.getElementById('saveBtn');
const croppingImg = document.getElementById('cropImage');
const getHidden = document.getElementById('hideDiv')

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  const fileUrl = URL.createObjectURL(file);
  croppingImg.src = fileUrl;

  const cropper = new Cropper(croppingImg, {
    aspectRatio: 0,
    viewMode: 2,
  });

  saveBtn.classList.replace('d-none', 'd-block');
  saveBtn.addEventListener('click', () => {
    const croppedCanvas = cropper.getCroppedCanvas();
    console.log(croppedCanvas);
    const croppedImage = croppedCanvas.toDataURL("image/jpg");
    getHidden.classList.add('d-none');
    saveBtn.classList.add('d-none');

    proImg.src = croppedImage;
    let croppedUrl = URL.createObjectURL(croppedImage);
    file = croppedUrl;

  });
});










// const fileInput = document.getElementById('file-input');
// const proImg = document.getElementById('profileImg');
// const saveBtn = document.getElementById('saveBtn');
// const croppingImg = document.getElementById('cropImage');
// const getHidden = document.getElementById('hideDiv');

// // const FormData = require("form-data");

// fileInput.addEventListener('change', (event) => {
//   const file = event.target.files[0];
//   const fileUrl = URL.createObjectURL(file);
//   croppingImg.src = fileUrl;
//   console.log(fileUrl);

//   const cropper = new Cropper(croppingImg, {
//     aspectRatio: 0,
//     viewMode: 2,
//   });

//   saveBtn.classList.replace('d-none', 'd-block');
//   console.log("something happened")

//   saveBtn.addEventListener('click', () => {
//     const croppedCanvas = cropper.getCroppedCanvas();
//     croppedCanvas.toBlob((blob) => {
//         const file1 = new File([blob], 'cropped_image.jpeg', { type: 'image/jpeg' });
        
//         const formData = new FormData();
//         formData.append('image', file1);
        
//         axios.post('/updateProPic', formData, {
//             headers: {
//                 'content-type': 'multipart/form-data'
//             }
//         }).then((response) => {
//           console.log(response);
//         }).catch((error) => {
//           console.log(error);
//         });
//     }, 'image/jpeg', 0.35);

//     getHidden.classList.add('d-none');
//     saveBtn.classList.add('d-none');
//     proImg.src = croppedImage;
//   });
// });

