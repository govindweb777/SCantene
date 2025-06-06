import { useState, useEffect } from "react";
import AdminMenu from "./AdminMenu";
import { useNavigate, useParams } from "react-router-dom";
import {
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductByIdQuery,
  useUploadProductImageMutation,
  useGetCouponCodeQuery,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import { useFetchBrandsQuery } from "../../redux/api/brandApiSlice";
import ReactQuill from "react-quill";
import { AiFillCloseCircle } from "react-icons/ai";
import { FiPlus, FiMinus } from "react-icons/fi";
import { BASE_URL } from "../../redux/constants";
import { io } from "socket.io-client";
import { useFetchSubCategoriesQuery } from "../../redux/api/subCategoryApiSlice";

const AdminProductUpdate = () => {
  const params = useParams();
  const socket = io(`${BASE_URL}`);

  const { data } = useGetProductByIdQuery(params._id);
  const productData = data?.product;
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mrp, setMrp] = useState(0);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [breadth, setBreadth] = useState(0);
  const [weight, setWeight] = useState(0);
  const [tax, setTax] = useState(0);
  const [offerPrice, setOfferPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [countInStock, setCountInStock] = useState(0);
  const [lowStockThreshold, setLowStockThreshold] = useState(0);
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [images, setImages] = useState([]);
  const [specification, setSpecification] = useState("");
  const [shippingRate, setShippingRate] = useState("");
  const [aboutTheBrand, setAboutTheBrand] = useState("");

  // Added: Product-level coupons state
  const [productCoupons, setProductCoupons] = useState([]);

  const [slabs, setSlabs] = useState([
    { minQuantity: "", maxQuantity: "", price: "", couponId: "", expire: "" },
  ]);

  const [isEnable, setIsEnable] = useState(true);
  const [outOfStock, setOutOfStock] = useState(false);
  const [removedImages, setRemovedImages] = useState([]);

  const navigate = useNavigate();
  const { data: categories = [] } = useFetchCategoriesQuery();
  const { data: subCategories = [] } = useFetchSubCategoriesQuery();
  const { data: brands = [] } = useFetchBrandsQuery();
  const [uploadProductImage] = useUploadProductImageMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const { data: coupons } = useGetCouponCodeQuery();

  //variants and extra fields 
  const [sku,setSku] = useState("");
  const [variants, setVariants] = useState([]);
const [attributes, setAttributes] = useState([]);
const [tags, setTags] = useState([]);
const [keywords, setKeywords] = useState([]);
const [unit, setUnit] = useState("");
const [isDigital, setIsDigital] = useState(false);
const [downloadLink, setDownloadLink] = useState("");
const [visibility, setVisibility] = useState(true);
const [returnable, setReturnable] = useState(false);
const [returnWindow, setReturnWindow] = useState(0);
const [warrantyPeriod, setWarrantyPeriod] = useState("");
const [deliveryDays, setDeliveryDays] = useState(0);
const [isFeatured, setIsFeatured] = useState(false);
const [isBestSeller, setIsBestSeller] = useState(false);

  useEffect(() => {
    if (productData) {
      setName(productData.name);
      setDescription(productData.description);
      setMrp(productData.mrp);
      setOfferPrice(productData.offerPrice);
      setCategory(productData.category);
      setSubCategory(productData.subCategory);
      setBrand(productData.brand?._id);
      setCountInStock(productData.countInStock);
      setLowStockThreshold(productData.lowStockThreshold || 0);
      setIsOutOfStock((prevState) => !prevState);
      setImages(productData.images || []);
      setSpecification(productData.specification);
      setAboutTheBrand(productData.aboutTheBrand);

      // Added: Set product-level coupons
      setProductCoupons(productData.coupons || []);

      setSlabs(
        productData.slabs?.map((slab) => ({
          minQuantity: slab.minQuantity || "",
          maxQuantity: slab.maxQuantity || "",
          price: slab.price || "",
          couponId: slab.couponId || "",
          // Convert 'YYYY-MM-DD' to 'DD-MM-YYYY'
          expire: slab.expire
            ? new Date(slab.expire)
                .toLocaleDateString("en-GB")
                .replace(/\//g, "-")
            : "",
        })) || [
          {
            minQuantity: "",
            maxQuantity: "",
            price: "",
            couponId: "",
            expire: "",
          },
        ]
      );

      setIsEnable(productData.isEnable);
      setOutOfStock(productData.outOfStock);
      setHeight(productData.height);
      setWeight(productData.weight);
      setWidth(productData.width);
      setTax(productData.tax);
      setBreadth(productData.breadth);
      setShippingRate(productData.shippingRate);

      //variants data
      setVariants(productData.variants || []);
      setSku(productData.sku || "");
setAttributes(productData.attributes || []);
setTags(productData.tags || []);
setKeywords(productData.keywords || []);
setUnit(productData.unit || "");
setIsDigital(productData.isDigital || false);
setDownloadLink(productData.downloadLink || "");
setVisibility(productData.visibility !== false); // default true
setReturnable(productData.returnable || false);
setReturnWindow(productData.returnWindow || 0);
setWarrantyPeriod(productData.warrantyPeriod || "");
setDeliveryDays(productData.deliveryDays || 0);
setIsFeatured(productData.isFeatured || false);
setIsBestSeller(productData.isBestSeller || false);
    }
  }, [productData]);

  // In uploadFileHandler function:
  const uploadFileHandler = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) {
      toast.error("Please select at least one image to upload.");
      return;
    }

    // Log selected files to verify what we're sending
    console.log(
      "Files selected:",
      files.map((f) => f.name)
    );

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    try {
      const response = await uploadProductImage(formData).unwrap();
      console.log("Upload response:", response);

      if (response?.images?.length) {
        // Create a Set to prevent duplicates
        const uniqueImages = new Set([...images]);

        // Add new images, ensuring no duplicates
        response.images.forEach((img) => {
          const imagePath = img.startsWith("/") ? img : "/" + img;
          uniqueImages.add(imagePath);
        });

        // Convert back to array and update state
        setImages(Array.from(uniqueImages));
        toast.success(
          `${response.images.length} images uploaded successfully!`
        );
      } else {
        toast.error("No images returned from the server.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        "Error uploading images: " + (error.data?.message || error.message)
      );
    }
  };
  const handleRemoveImage = (index) => {
    // Save the removed image path to removedImages state
    const imageToRemove = images[index];
    setRemovedImages((prev) => [...prev, imageToRemove]);

    // Remove from current images array
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  // Added: Function to handle product-level coupons
  const handleProductCouponChange = (couponId) => {
    if (productCoupons.includes(couponId)) {
      setProductCoupons(productCoupons.filter((id) => id !== couponId));
    } else {
      setProductCoupons([...productCoupons, couponId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit triggered"); // Debugging

    try {
      const formData = {
        name,
        description,
        mrp,
        height,
        width,
        breadth,
        weight,
        tax,
        offerPrice,
        category,
        subCategory,
        brand,
        countInStock,
        lowStockThreshold,
        isEnable,
        outOfStock,
        specification,
        aboutTheBrand,
        slabs: slabs.map((slab) => {
          let expireDate = null;

          if (slab.expire) {
            const parts = slab.expire.split("-"); // Assuming "DD-MM-YYYY"
            if (parts.length === 3) {
              expireDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // Convert to YYYY-MM-DD
            }
          }

          return {
            ...slab,
            expire: expireDate ? expireDate.toISOString().split("T")[0] : null, // Ensure valid ISO string
          };
        }),
        coupons: productCoupons,
        // Make sure we're sending complete image arrays
        images: images,
        removedImages: removedImages,
        shippingRate,
       
     // Optional but recommended
      variants,
      attributes,
      tags,
      keywords,
      unit,
      isDigital,
      downloadLink,
      visibility,
      returnable,
      returnWindow,
      warrantyPeriod,
      deliveryDays,
      isFeatured,
      isBestSeller,
      };

      console.log("Submitting Product Update:", formData); // Debugging API payload
      await updateProduct({ productId: params._id, formData });
      toast.success("Product updated successfully");
      navigate("/admin/admin-inventory");
    } catch (err) {
      console.error("API Error:", err);
      toast.error("Product update failed");
    }
  };
  useEffect(() => {
    // Check for duplicates in images array
    const uniqueUrls = new Set();
    const duplicates = [];

    images.forEach((url) => {
      if (uniqueUrls.has(url)) {
        duplicates.push(url);
      } else {
        uniqueUrls.add(url);
      }
    });

    if (duplicates.length > 0) {
      console.warn("Duplicate images detected:", duplicates);
      // Optional: Auto-fix duplicates
      setImages(Array.from(uniqueUrls));
    }
  }, [images]);
  const handleSlabChange = (index, field, value) => {
    const updatedSlabs = [...slabs];

    if (field === "expire") {
      // Convert YYYY-MM-DD to DD-MM-YYYY for storage
      const [year, month, day] = value.split("-");
      updatedSlabs[index][field] = `${day}-${month}-${year}`;
    } else {
      updatedSlabs[index][field] = value;
    }

    setSlabs(updatedSlabs);
  };

  // Function to remove a slab
  const removeSlab = (index) => {
    const newSlabs = slabs.filter((_, i) => i !== index);
    setSlabs(newSlabs);
  };

  // Function to add a new slab
  const addSlab = () => {
    setSlabs([
      ...slabs,
      { minQuantity: "", maxQuantity: "", price: "", couponId: "" },
    ]);
  };

  const toggleEnable = () => {
    setIsEnable(!isEnable);
  };

  const toggleStockStatus = () => {
    setOutOfStock((prevState) => !prevState);
  };

  const handleVariantChange = (index, e) => {
  const { name, value, type } = e.target;

  setVariants((prevVariants) => {
    const updatedVariants = [...prevVariants];

    // If the field is numeric, convert value accordingly
    let val = value;
    if (type === "number") {
      val = value === "" ? "" : Number(value);
    }

    // Update the specific property of the variant at given index
    updatedVariants[index] = {
      ...updatedVariants[index],
      [name]: val,
    };

    return updatedVariants;
  });
};


  const handleVariantImageChange = async (index, e) => {
  const files = Array.from(e.target.files);

  if (files.length === 0) {
    toast.error("Please select at least one image to upload.");
    return;
  }

  const formDataData = new FormData();
  files.forEach((file) => formDataData.append("images", file));

  try {
    const response = await uploadProductImage(formDataData).unwrap();

    if (response?.images?.length) {
      toast.success("Variant images uploaded successfully!");

      setVariants((prevVariants) => {
        const updatedVariants = [...prevVariants];
        updatedVariants[index] = {
          ...updatedVariants[index],
          images: [
            ...(updatedVariants[index]?.images || []),
            ...response.images,
          ],
        };
        return updatedVariants;
      });
    } else {
      toast.error("No images returned from the server.");
    }
  } catch (error) {
    console.error("Upload Error:", error);
    toast.error(error?.data?.message || "Error uploading images.");
  }
};

const handleRemoveVariantImage = (variantIndex, imageIndex) => {
  setVariants((prevVariants) => {
    const updatedVariants = [...prevVariants];
    const updatedImages = [...(updatedVariants[variantIndex].images || [])];

    // Remove the image at the given index
    updatedImages.splice(imageIndex, 1);

    // Update the variant's images
    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      images: updatedImages,
    };

    return updatedVariants;
  });
};


  useEffect(() => {
    socket.on("productAdded", (newProduct) => {
      console.log("New Product Added:", newProduct);
      // Refresh product list or update state
    });

    socket.on("productUpdated", (updatedProduct) => {
      console.log("Product Updated:", updatedProduct);
      // Refresh product list or update state
    });

    socket.on("productDeleted", (deletedProduct) => {
      console.log("Product Deleted:", deletedProduct);
      // Refresh product list or update state
    });

    return () => {
      socket.off("productAdded");
      socket.off("productUpdated");
      socket.off("productDeleted");
    };
  }, []);

  return (
    <>
      <div className="flex flex-col items-center darktheme px-6">
        <section className="w-full  darktheme bg-opacity-50 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 border-2 border-gray-600 ">
          <div className="md:w-1/4 p-3 mt-2">
            {/* <AdminMenu /> */}
          </div>
          <h2 className="text-2xl font-semibold mb-6 text-center text-customBlue">
            Update Product
          </h2>

          {images.length > 0 && (
            <div className="text-center flex gap-4 flex-wrap">
              {images.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={BASE_URL + url}
                    alt={`product-${index}`}
                    className="max-h-[100px] object-cover border border-gray-400 rounded-md my-2"
                  />
                  {/* <span className="absolute top-0 left-0 bg-black bg-opacity-70 text-white text-xs p-1">
                    Image {index + 1}
                  </span> */}
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-4 right-2 text-red-500 bg-white rounded-full text-lg"
                  >
                    <AiFillCloseCircle />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mb-3">
            <label className="border border-gray-400 px-4 block w-full text-center rounded-lg cursor-pointer font-bold py-8">
              {images.length > 0
                ? `${images.length} files selected`
                : "Upload Images 400 X 500"}
              <input
                type="file"
                name="images"
                accept="image/*"
                multiple
                onChange={uploadFileHandler}
                className="hidden"
              />
            </label>
          </div>

          <div className="w-full">
            <div className="flex flex-col">
              <div className="flex justify-between gap-4 flex-col md:flex-row">
                <div className="w-full">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    className="p-2 mb-3 w-full border border-gray-400 rounded-lg darkthemeinput"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="w-full">
                  <label>MRP</label>
                  <input
                    type="number"
                    className="p-2 mb-3 w-full border border-gray-400 rounded-lg darkthemeinput"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                  />
                </div>
                <div className="w-full">
                  <label>Height</label>
                  <input
                    type="number"
                    className="p-2 mb-3 w-full border border-gray-400 rounded-lg darkthemeinput"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>

                <div className="w-full">
                  <label>Width</label>
                  <input
                    type="number"
                    className="p-2 mb-3 w-full border border-gray-400 rounded-lg darkthemeinput"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                  />
                </div>

                <div className="w-full">
                  <label>Breadth</label>
                  <input
                    type="number"
                    className="p-2 mb-3 w-full border border-gray-400 rounded-lg darkthemeinput"
                    value={breadth}
                    onChange={(e) => setBreadth(e.target.value)}
                  />
                </div>
                <div className="w-full">
                  <label>Weight</label>
                  <input
                    type="number"
                    className="p-2 mb-3 w-full border border-gray-400 rounded-lg darkthemeinput"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Product Weight"
                  />
                </div>
                <div className="w-full">
                  <label>Tax</label>
                  <input
                    type="number"
                    className="p-2 mb-3 w-full border border-gray-400 rounded-lg darkthemeinput"
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                    placeholder="Enter tax percentage"
                  />
                </div>
                <div className="w-full">
                  <label>Shipping Rate</label>
                  <input
                    type="number"
                    className="p-2 mb-3 w-full border border-gray-400 rounded-lg darkthemeinput"
                    value={shippingRate}
                    onChange={(e) => setShippingRate(e.target.value)}
                    placeholder="Enter Shipping percentage"
                  />
                </div>
              </div>

              {/* Variants */}
<div className="mb-6">
  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
    Product Variants
  </h3>

  {variants.map((variant, index) => (
    <div
      key={index}
      className="mb-4 p-4 border rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
    >
      <h4 className="text-md font-semibold mb-2 text-gray-800 dark:text-gray-200">
        Variant #{index + 1}
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Color */}
        <div>
          <label
            htmlFor={`color-${index}`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Color
          </label>
          <input
            type="text"
            id={`color-${index}`}
            name="color"
            value={variant.color}
            onChange={(e) => handleVariantChange(index, e)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g. Red"
          />
        </div>

        {/* Size */}
        <div>
          <label
            htmlFor={`size-${index}`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Size
          </label>
          <input
            type="text"
            id={`size-${index}`}
            name="size"
            value={variant.size}
            onChange={(e) => handleVariantChange(index, e)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g. M, L, XL"
          />
        </div>

        {/* Additional Price */}
        <div>
          <label
            htmlFor={`additionalPrice-${index}`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Additional Price
          </label>
          <input
            type="number"
            id={`additionalPrice-${index}`}
            name="additionalPrice"
            value={variant.additionalPrice}
            onChange={(e) => handleVariantChange(index, e)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="0"
          />
        </div>

        {/* Stock Count */}
        <div>
          <label
            htmlFor={`countInStock-${index}`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Stock Count
          </label>
          <input
            type="number"
            id={`countInStock-${index}`}
            name="countInStock"
            value={variant.countInStock}
            onChange={(e) => handleVariantChange(index, e)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="0"
          />
        </div>

        {/* SKU */}
        <div>
          <label
            htmlFor={`sku-${index}`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            SKU
          </label>
          <input
            type="text"
            id={`sku-${index}`}
            name="sku"
            value={variant.sku}
            onChange={(e) => handleVariantChange(index, e)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="SKU12345"
          />
        </div>

        {/* Images upload */}
        <div className="sm:col-span-2 lg:col-span-5">
          <label
            htmlFor={`images-${index}`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Upload Images
          </label>
          <input
            type="file"
            id={`images-${index}`}
            multiple
            accept="image/*"
            onChange={(e) => handleVariantImageChange(index, e)}
            className="block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100
                       dark:file:bg-gray-700 dark:file:text-gray-300"
          />

          {/* Preview thumbnails */}
          <div className="flex flex-wrap mt-2 gap-2">
            {variant.images && variant.images.length > 0 &&
              variant.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                  
                    src={typeof img === "string" ? BASE_URL+img : URL.createObjectURL(img)}
                    alt={`Variant ${index + 1} Image ${i + 1}`}
                    className="h-16 w-16 object-cover rounded-md border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveVariantImage(index, i)}
                    className="absolute top-[-6px] right-[-6px] bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-80 hover:opacity-100"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  ))}

  {/* Button to add a new variant */}
  <button
    type="button"
    onClick={() =>
      setVariants((prev) => [
        ...prev,
        {
          color: "",
          size: "",
          additionalPrice: 0,
          countInStock: 0,
          sku: "",
          images: [],
        },
      ])
    }
    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
  >
    Add Variant
  </button>
</div>

{/* SKU & Meta Info */}
<div className="mb-6">
  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
    SKU & Meta Info
  </h3>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div>
      <label
        htmlFor="sku"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        SKU
      </label>
      <input
        type="text"
        id="sku"
        name="sku"
        value={sku}
        onChange={(e) => setSku(e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
        placeholder="Enter SKU"
      />
    </div>

    <div>
      <label
        htmlFor="unit"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Unit (e.g. pcs, kg)
      </label>
      <input
        type="text"
        id="unit"
        name="unit"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
        placeholder="e.g., pcs"
      />
    </div>
  </div>
</div>

{/* Logistics & Return Policy */}
<div className="mb-6">
  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
    Logistics & Return Policy
  </h3>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div>
      <label
        htmlFor="deliveryDays"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Delivery Days
      </label>
      <input
        type="number"
        id="deliveryDays"
        name="deliveryDays"
        value={deliveryDays}
        onChange={(e) => setDeliveryDays(Number(e.target.value))}
        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
        placeholder="e.g., 5"
      />
    </div>

    <div>
      <label
        htmlFor="returnWindow"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Return Window (days)
      </label>
      <input
        type="number"
        id="returnWindow"
        name="returnWindow"
        value={returnWindow}
        onChange={(e) => setReturnWindow(Number(e.target.value))}
        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
        placeholder="e.g., 7"
      />
    </div>

    <div>
      <label
        htmlFor="warrantyPeriod"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Warranty Period (months)
      </label>
      <input
        type="number"
        id="warrantyPeriod"
        name="warrantyPeriod"
        value={warrantyPeriod}
        onChange={(e) => setWarrantyPeriod(Number(e.target.value))}
        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
        placeholder="e.g., 12"
      />
    </div>

    <div className="flex items-center mt-6">
      <input
        type="checkbox"
        id="returnable"
        name="returnable"
        checked={returnable}
        onChange={(e) => setReturnable(e.target.checked)}
        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
      />
      <label
        htmlFor="returnable"
        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
      >
        Returnable
      </label>
    </div>
  </div>
</div>

{/* Tags & Keywords */}
<div className="mb-6">
  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
    SEO Tags & Keywords
  </h3>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Tags
      </label>
      <input
        type="text"
        value={tags.join(",")}
        onChange={(e) => setTags(e.target.value.split(","))}
        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
        placeholder="e.g., organic, summer"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Keywords
      </label>
      <input
        type="text"
        value={keywords.join(",")}
        onChange={(e) => setKeywords(e.target.value.split(","))}
        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
        placeholder="e.g., tshirt, cotton"
      />
    </div>
  </div>
</div>

{/* Product Visibility & Status */}
<div className="mb-6">
  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
    Product Visibility & Status
  </h3>
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
    {[ 
      { label: "Enable Product", checked: isEnable, setter: setIsEnable },
      { label: "Best Seller", checked: isBestSeller, setter: setIsBestSeller },
      { label: "Featured", checked: isFeatured, setter: setIsFeatured },
      { label: "Digital Product", checked: isDigital, setter: setIsDigital },
    ].map(({ label, checked, setter }) => (
      <div key={label} className="flex items-center mt-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setter(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          id={label.replace(/\s+/g, '')}
        />
        <label
          htmlFor={label.replace(/\s+/g, '')}
          className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      </div>
    ))}

    <div>
      <label
        htmlFor="visibility"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Visibility
      </label>
      <select
        id="visibility"
        value={visibility}
        onChange={(e) => setVisibility(e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
      >
        <option value="Public">Public</option>
        <option value="Draft">Draft</option>
        <option value="Private">Private</option>
      </select>
    </div>
  </div>
</div>



              <div className="flex justify-between gap-4 flex-col md:flex-row">
                <div className="w-full">
                  <label>Offer Price</label>
                  <input
                    type="number"
                    className="p-2 mb-3 w-full border border-gray-400 rounded-lg darkthemeinput"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                  />
                </div>
                <div className="w-full">
                  <label>Brand</label>
                  <select
                    className="p-2 mb-3 w-full border border-gray-400 rounded-lg darkthemeinput"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  >
                    <option value="">Select Brand</option>
                    {brands.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <label htmlFor="" className="my-5">
              Description
            </label>
            <ReactQuill
              value={description}
              onChange={(value) => setDescription(value)}
              theme="snow"
              className="w-full"
            />

            <div className="w-full">
              <label>Count In Stock</label>
              <input
                type="text"
                className="p-2 mb-3 w-full  border border-gray-400 rounded-lg darkthemeinput"
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
                placeholder="Stock Quantity"
              />
            </div>

            {/* Added: Product-level Coupons Section */}
            <div className="mb-5">
              <h2 className="text-xl font-semibold">Product Coupons</h2>
              <p className="text-gray-400 mb-2">
                Select coupons applicable for this product
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {coupons?.map((coupon) => (
                  <div key={coupon._id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`coupon-${coupon._id}`}
                      checked={productCoupons.includes(coupon._id)}
                      onChange={() => handleProductCouponChange(coupon._id)}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor={`coupon-${coupon._id}`} className="text-sm">
                      {coupon.name} ({coupon.percentage}% off)
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Slabs */}
            <div className="mb-5">
              <h2 className="text-xl font-semibold">Pricing Slabs</h2>
              {slabs.length === 0 && (
                <p className="text-gray-400">
                  No slabs found. You can add new slabs below.
                </p>
              )}
              {slabs.map((slab, index) => (
                <div
                  key={index}
                  className="flex items-center flex-col md:flex-row space-x-3 my-2"
                >
                  <div className="flex w-full gap-2">
                    <input
                      type="number"
                      placeholder="Min Quantity"
                      value={slab.minQuantity}
                      onChange={(e) =>
                        handleSlabChange(index, "minQuantity", e.target.value)
                      }
                      className="p-2 border border-gray-400 rounded-lg darkthemeinput w-full"
                    />
                    <input
                      type="number"
                      placeholder="Max Quantity"
                      value={slab.maxQuantity}
                      onChange={(e) =>
                        handleSlabChange(index, "maxQuantity", e.target.value)
                      }
                      className="p-2 border border-gray-400 rounded-lg darkthemeinput w-full"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={slab.price}
                      onChange={(e) =>
                        handleSlabChange(index, "price", e.target.value)
                      }
                      className="p-2 border border-gray-400 rounded-lg darkthemeinput w-full"
                    />
                    {/* <select
                      value={slab.couponId || ""}
                      onChange={(e) =>
                        handleSlabChange(index, "couponId", e.target.value)
                      }
                      className="p-2 border border-gray-400 rounded-lg darkthemeinput w-full"
                    >
                      <option value="">Select Coupon (Optional)</option>
                      {coupons?.map((coupon) => (
                        <option key={coupon._id} value={coupon._id}>
                          {coupon.name} - {coupon.percentage}% off
                        </option>
                      ))}
                    </select>

                    <input
                      type="date"
                      placeholder="Expire Date"
                      value={
                        slab.expire
                          ? slab.expire.split("-").reverse().join("-") // Convert DD-MM-YYYY → YYYY-MM-DD
                          : ""
                      }
                      onChange={(e) =>
                        handleSlabChange(index, "expire", e.target.value)
                      }
                      className="p-2 border border-gray-400 rounded-lg darkthemeinput w-full"
                    /> */}
                  </div>

                  <button
                    onClick={() => removeSlab(index)}
                    className="p-2 border border-gray-400 rounded-lg text-white bg-red-500 flex items-center space-x-2"
                  >
                    <FiMinus className="h-5 w-5" />
                  </button>
                </div>
              ))}

              <button
                onClick={addSlab}
                className="mb-4 py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
              >
                <FiPlus className="w-5 h-5 inline-block mr-2" />
                New Slab
              </button>
            </div>

            <div className="flex justify-between gap-4 flex-col md:flex-row">
              <div className="w-full">
                <label>Low Stock Threshold</label>
                <input
                  type="number"
                  className="p-2 mb-3 w-full border border-gray-400 rounded-lg darkthemeinput"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  placeholder="Low Stock Threshold"
                />
              </div>
              <div className="w-full">
                <label>Category</label>
                <select
                  className="p-2 mb-3 w-full border border-gray-400 rounded-lg darkthemeinput"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
                            <div className="w-full">
                <label>Sub-Category</label>
                <select
                  className="p-2 mb-3 w-full border border-gray-400 rounded-lg darkthemeinput"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                >
                  <option value="">Select Sub-Category</option>
                  {subCategories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label>About the Brand</label>
            <ReactQuill
              value={aboutTheBrand}
              onChange={(value) => setAboutTheBrand(value)}
              theme="snow"
              className="w-full mb-4"
            />

            <label>Specifications</label>
            <ReactQuill
              value={specification}
              onChange={(value) => setSpecification(value)}
              theme="snow"
              className="w-full"
            />

            <div className="flex gap-8 mt-5">
              <div className="flex items-center gap-4">
                <label htmlFor="enable-toggle" className="font-medium">
                  Enable Product
                </label>
                <button
                  type="button"
                  value={isEnable}
                  onClick={toggleEnable}
                  className={`relative inline-flex items-center w-32 h-8 rounded-full transition-colors duration-300 ${
                    isEnable ? "bg-green-500" : "bg-gray-400"
                  }`}
                >
                  <span
                    className={`absolute w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                      isEnable ? "right-1 left-auto" : "left-1"
                    }`}
                  />
                  <span className="absolute left-8 text-xs font-semibold text-white">
                    {isEnable ? "Enabled" : "Disabled"}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-4">
                <label htmlFor="out-of-stock-toggle" className="font-medium">
                  Stock Status
                </label>
                <button
                  type="button"
                  value={outOfStock}
                  onClick={toggleStockStatus}
                  className={`relative inline-flex items-center w-32 h-8 rounded-full transition-colors duration-300 ${
                    outOfStock ? "bg-red-500" : "bg-green-500"
                  }`}
                >
                  <span
                    className={`absolute w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                      outOfStock ? "right-1 left-auto" : "left-1"
                    }`}
                  />
                  <span className="absolute left-8 text-xs font-semibold text-white">
                    {outOfStock ? "Out Stock" : "In Stock"}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => navigate("/admin/allproductslist")}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 w-full sm:w-auto"
              >
                Go Back
              </button>

              <button
                onClick={handleSubmit}
                className="bg-customBlue text-white py-2 px-4 rounded-lg hover:bg-customBlue/80 focus:outline-none focus:ring-2 focus:ring-customBlue focus:ring-opacity-50 w-full sm:w-auto"
              >
                Update
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AdminProductUpdate;
