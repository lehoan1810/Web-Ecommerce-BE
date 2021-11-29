const Product = require("./../models/productSP");

//function validate cart
module.exports = async (Model) => {
	// 1) set totalPrice is 0 if no items in cart
	if (Model.cart.items.length === 0) {
		Model.cart.totalPrice = 0;
	}
	// 2) update price/name/totalPrice of product in items cart if admin/assistant update product
	Model.cart.items.forEach(async (item) => {
		const uptodateProduct = await Product.findById(item.productId);

		//if product in cart exists in shop
		if (uptodateProduct) {
			let differencePrice = 0;
			differencePrice += uptodateProduct.price - item.price;
			item.nameProduct = uptodateProduct.name;
			item.price = uptodateProduct.price;
			Model.cart.totalPrice += differencePrice * item.qty;
			console.log("item.productName: ", item.nameProduct);
			console.log("differencePrice (exists):", differencePrice);
		}

		//if product in cart not exists in shop anymore
		else {
			//get current index of item in cart
			const isExisting = Model.cart.items.findIndex(
				(i) =>
					new String(i.productId).trim() === new String(item.productId).trim()
			);
			Model.cart.totalPrice -= item.price * item.qty;
			Model.cart.items.splice(isExisting, 1);
		}
	});
};
