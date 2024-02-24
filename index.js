const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

// const brand = require("./brand");

const ports = process.env.PORT || 3000;
const server = express();
server.use(bodyParser.json());
server.use(cors());

//CREATE CONNECTION ==========
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "shop",
  port: 3306,
});

// DB CONNECTION ===========
db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to database");
});

module.exports = {
  server: server,
  bodyParser,
  mysql,
  express,
  multer,
  db,
};
// checking connection
server.listen(ports, () => {
  console.log("server running ", ports);
});

// ================================ brand query start -==================================
// get all brand data
server.get("/brand", (req, res) => {
  let qr = "select * from brand";
  db.query(qr, (err, result) => {
    if (err) {
      console.log("Error : ", err);
      return err;
    }
    if (result.length > 0) {
      res.send({
        message: "get all brand details",
        data: result,
      });
    }
  });
});

// Set up Multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../shopAdmin/src/assets/uploads/brands"); // Destination folder where the files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// create brand data ===> POST
server.post("/addBrand", upload.single("brand_image"), (req, res) => {
  // Ensure file is uploaded
  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded." });
  }
  const { filename, originalname, path } = req.file;
  let brand_name = req.body.brand_name;
  let qr = `INSERT INTO brand(brand_name, brand_img) VALUES(
              '${brand_name}',
              '${filename}'
          )`;
  db.query(qr, (err, result) => {
    if (err) {
      console.error("Error inserting brand data:", err);
      return res.status(500).send({ message: "Error inserting brand data." });
    }
    res.send({
      message: "Single brand data inserted successfully.",
      status: true,
    });
  });
});
// get all single brand data
server.get("/getSingleBrand/:brand_id", (req, res) => {
  const {
    params: { brand_id },
  } = req;
  let qr = `SELECT * FROM brand WHERE brand_id='${brand_id}'`;
  db.query(qr, (err, result) => {
    if (err) {
      console.error("Error fetching brand details:", err);
      return res.status(500).send({
        message: "Error fetching brand details",
        status: false,
      });
    }

    if (result.length > 0) {
      res.send({
        message: "Get all brand details",
        data: result,
        status: true,
      });
    } else {
      res.send({
        message: "No brand found with the specified ID",
        data: [],
        status: false,
      });
    }
  });
});

// Set up Multer for file upload
const brandStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../shopAdmin/src/assets/uploads/brands"); // Destination folder where the files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const uploadBrand = multer({ storage: brandStorage });

//update function
server.put(
  "/updateSingleBrand/:id",
  uploadBrand.single("new_brand_img"),
  (req, res) => {
    const { id: primaryId } = req.params;
    let brand_name = req.body.brand_name;
    let filename = "";

    // Check if a file is uploaded
    if (req.file) {
      filename = req.file.filename;
      console.log(filename, "filename from file uploaded");
      updateBrand(primaryId, brand_name, filename, res);
    } else {
      // If no file uploaded, get the existing filename from the database
      let qr = `SELECT brand_img FROM brand WHERE brand_id = '${primaryId}'`;
      db.query(qr, [primaryId], (err, result) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .send({ message: "Error retrieving brand data." });
        }
        if (result.length > 0) {
          console.log(result);
          filename = result[0].brand_img;

          // Update the brand with only the brand name
          updateBrand(primaryId, brand_name, filename, res);
        }
      });
    }
  }
);

function updateBrand(primaryId, brand_name, filename, res) {
  let qr = `UPDATE brand SET brand_name = '${brand_name}', brand_img = '${filename}' WHERE brand_id = '${primaryId}'`;
  console.log(qr);
  db.query(qr, [brand_name, filename, primaryId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ message: "Error updating brand data." });
    }
    res.send({
      message: "Single brand data updated successfully.",
    });
  });
}

// delete brand data -- start here
server.delete("/deleteSingleBrand/:brand_id", (req, res) => {
  const {
    params: { brand_id },
  } = req;
  console.log(brand_id, "brand_id will delete");
  let qr = `DELETE FROM brand WHERE brand_id='${brand_id}'`;
  console.log(qr);
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ message: "Error deleting brand." });
    }
    if (result.affectedRows > 0) {
      res.send({ message: "Brand deleted successfully." });
    } else {
      res.status(404).send({ message: "Brand not found." });
    }
  });
});
// delete brand data -- end here

// ================================ category query start -==================================

// get all category data
server.get("/category", (req, res) => {
  let qr = "select * from category";
  db.query(qr, (err, result) => {
    if (err) {
      console.log("Error : ", err);
      return err;
    }
    if (result.length > 0) {
      res.send({
        message: "get all category details",
        data: result,
      });
    }
  });
});
// Set up Multer for file upload
const categoryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../shopAdmin/src/assets/uploads/category"); // Destination folder where the files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const categoryUpload = multer({ storage: categoryStorage });

// add  category ===> POST
server.post(
  "/addCategory",
  categoryUpload.single("category_img"),
  (req, res) => {
    // Ensure file is uploaded
    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded." });
    }
    const { filename, originalname, path } = req.file;
    let category_name = req.body.category_name;
    let qr = `INSERT INTO category(category_name, category_img) VALUES(
                '${category_name}',
                '${filename}'
            )`;
    console.log(qr);
    db.query(qr, (err, result) => {
      if (err) {
        console.error("Error inserting category data:", err);
        return res
          .status(500)
          .send({ message: "Error inserting category data." });
      }
      res.send({
        message: "Single category data inserted successfully.",
        status: true,
      });
    });
  }
);

// get all single category data
server.get("/getSingleCategory/:category_id", (req, res) => {
  const {
    params: { category_id },
  } = req;
  let qr = `SELECT * FROM category WHERE category_id='${category_id}'`;
  db.query(qr, (err, result) => {
    if (err) {
      console.error("Error fetching category details:", err);
      return res.status(500).send({
        message: "Error fetching category details",
        status: false,
      });
    }

    if (result.length > 0) {
      res.send({
        message: "Get all category details",
        data: result,
        status: true,
      });
    } else {
      res.send({
        message: "No category found with the specified ID",
        data: [],
        status: false,
      });
    }
  });
});

// const updateCategoryImage = multer({ storage: categoryStorage });

//update function
server.put(
  "/updateSingleCategory/:id",
  categoryUpload.single("new_category_img"),
  (req, res) => {
    const { id: primaryId } = req.params;
    let category_name = req.body.category_name;
    let filename = "";

    // Check if a file is uploaded
    if (req.file) {
      filename = req.file.filename;
      console.log(filename, "filename from file uploaded");
      updateCategory(primaryId, category_name, filename, res);
    } else {
      // If no file uploaded, get the existing filename from the database
      console.log("no file uploaded");
      let qr = `SELECT category_img FROM category WHERE category_id = '${primaryId}'`;
      db.query(qr, [primaryId], (err, result) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .send({ message: "Error retrieving brand data." });
        }
        if (result.length > 0) {
          console.log(result);
          filename = result[0].category_img;

          // Update the brand with only the brand name
          updateCategory(primaryId, category_name, filename, res);
        }
      });
    }
  }
);

function updateCategory(primaryId, category_name, filename, res) {
  let qr = `UPDATE category SET category_name = '${category_name}', category_img = '${filename}' WHERE category_id = '${primaryId}'`;
  console.log(qr);
  db.query(qr, [category_name, filename, primaryId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ message: "Error updating category data." });
    }
    res.send({
      message: "Single category data updated successfully.",
    });
  });
}

// delete category data -- start here
server.delete("/deleteSingleCategory/:category_id", (req, res) => {
  const {
    params: { category_id },
  } = req;
  console.log(category_id, "category_id will delete");
  let qr = `DELETE FROM category WHERE category_id='${category_id}'`;
  console.log(qr);
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ message: "Error deleting category." });
    }
    if (result.affectedRows > 0) {
      res.send({ message: "category deleted successfully." });
    } else {
      res.status(404).send({ message: "category not found." });
    }
  });
});
// delete brand data -- end here

// ============================== product query start
// get all category data
server.get("/product", (req, res) => {
  let qr = "select * from product";
  db.query(qr, (err, result) => {
    if (err) {
      console.log("Error : ", err);
      return err;
    }
    if (result.length > 0) {
      res.send({
        message: "get all product details",
        data: result,
      });
    }
  });
});

// Set up Multer for file upload for Product
const Productstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../shopAdmin/src/assets/uploads/products"); // Destination folder where the files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const uploadProduct = multer({ storage: Productstorage });

// create product data ===> POST
server.post("/addProduct", uploadProduct.single("product_img"), (req, res) => {
  // Ensure file is uploaded
  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded." });
  }
  const { filename, originalname, path } = req.file;
  let product_name = req.body.product_name;
  let product_price = req.body.product_price;
  let product_offer_price = req.body.product_offer_price;
  let product_category_id = req.body.product_category_id;
  let product_brand_id = req.body.product_brand_id;
  let product_stock_quantity = req.body.product_stock_quantity;
  let product_description = req.body.product_description;
  let product_remarks = req.body.product_remarks;
  let qr = `INSERT INTO product(product_name, product_price,product_offer_price,product_category_id, product_brand_id,product_img, product_stock_quantity,product_description,product_remarks) VALUES(
              '${product_name}',
              '${product_price}',
              '${product_offer_price}',
              '${product_category_id}',
              '${product_brand_id}',
              '${filename}',
              '${product_stock_quantity}',
              '${product_description}',
              '${product_remarks}'
          )`;
  // console.log(qr);
  db.query(qr, (err, result) => {
    if (err) {
      console.error("Error inserting product data:", err);
      return res.status(500).send({ message: "Error inserting product data." });
    }
    res.send({
      message: "Single product data inserted successfully.",
      status: true,
    });
  });
});

// delete product data -- start here
server.delete("/deleteSingleProduct/:product_id", (req, res) => {
  const {
    params: { product_id },
  } = req;
  console.log(product_id, "product_id will delete");
  let qr = `DELETE FROM product WHERE product_id='${product_id}'`;
  console.log(qr);
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ message: "Error deleting product." });
    }
    if (result.affectedRows > 0) {
      res.send({ message: "product deleted successfully." });
    } else {
      res.status(404).send({ message: "product not found." });
    }
  });
});
// delete brand data -- end here

// get single product  data
server.get("/getSingleProduct/:product_id", (req, res) => {
  const {
    params: { product_id },
  } = req;
  let qr = `SELECT * FROM product WHERE product_id='${product_id}'`;
  db.query(qr, (err, result) => {
    if (err) {
      console.error("Error fetching product details:", err);
      return res.status(500).send({
        message: "Error fetching product details",
        status: false,
      });
    }

    if (result.length > 0) {
      res.send({
        message: "Get all product details",
        data: result,
        status: true,
      });
    } else {
      res.send({
        message: "No product found with the specified ID",
        data: [],
        status: false,
      });
    }
  });
});

//update function
server.put(
  "/updateSingleProduct/:product_id",
  uploadProduct.single("new_product_img"),
  (req, res) => {
    const { product_id: primaryId } = req.params;
    const {
      product_name,
      product_price,
      product_offer_price,
      product_category_id,
      product_brand_id,
      product_stock_quantity,
      product_description,
      product_remarks,
    } = req.body;
    let filename = "";

    // Check if a file is uploaded
    if (req.file) {
      filename = req.file.filename;
      console.log(filename, "filename from file uploaded");
      updateProduct(
        primaryId,
        product_name,
        product_price,
        product_offer_price,
        product_category_id,
        product_brand_id,
        product_stock_quantity,
        product_description,
        product_remarks,
        filename,
        res
      );
    } else {
      // If no file uploaded, get the existing filename from the database
      console.log("no file uploaded");
      let qr = `SELECT product_img FROM product WHERE product_id = '${primaryId}'`;
      console.log(qr);
      db.query(qr, [primaryId], (err, result) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .send({ message: "Error retrieving brand data." });
        }
        if (result.length > 0) {
          console.log(result);
          filename = result[0].product_img;

          // Update the brand with only the brand name
          updateProduct(
            primaryId,
            product_name,
            product_price,
            product_offer_price,
            product_category_id,
            product_brand_id,
            product_stock_quantity,
            product_description,
            product_remarks,
            filename,
            res
          );
        }
      });
    }
  }
);

function updateProduct(
  primaryId,
  product_name,
  product_price,
  product_offer_price,
  product_category_id,
  product_brand_id,
  product_stock_quantity,
  product_description,
  product_remarks,
  filename,
  res
) {
  let qr = `UPDATE product SET 
   product_name = '${product_name}',
   product_price = '${product_price}',
   product_offer_price = '${product_offer_price}',
   product_category_id = '${product_category_id}',
   product_brand_id = '${product_brand_id}',
   product_stock_quantity = '${product_stock_quantity}',
   product_description = '${product_description}',
   product_remarks = '${product_remarks}',
   product_img = '${filename}' 
   WHERE product_id = '${primaryId}'`;
  console.log(qr);
  db.query(qr, [product_name, filename, primaryId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ message: "Error updating product data." });
    }
    res.send({
      message: "Single product data updated successfully.",
    });
  });
}

//to refresh the assets folder in chrome browser
server.use(
  "/assets",
  express.static(path.join(__dirname, "assets"), { maxAge: 0 })
);
server.get("/assets/uploads/brands/:imageName", (req, res) => {
  // Your logic to serve the image file
  // Set cache-control headers
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  console.log(req.params.imageName);
  // Send the image file
  // res.sendFile(path.join(__dirname, 'path_to_your_image_directory', req.params.imageName));
});
