const multer = require("multer");
const path = require("path"); // Import the path module
const fs = require("fs"); // Import the fs module
const storageSingle = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: function (req, file, cb) {
    const filename = file.fieldname + "-" + file.originalname;
    const filePath = path.join("../uploads/", filename);
    console.log(filePath);

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        cb(null, filename);
      } else {
        cb(null, file.fieldname);
      }
    });
  },
});
exports.uploadSingle = multer({
  storage: storageSingle,
  fileFilter: function (req, file, cb) {
    // console.log(file)
    checkFileType(file, cb);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images only!");
  }
}
