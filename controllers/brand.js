const Brand = require("../models/brand");
const slugif = require("slugify");

exports.createBrand = (req, res) => {
	const { name, category, createdBy } = req.body;

	const brand = new Brand({
		name: req.body.name,
		slug: slugif(name),
		category,
		createdBy: req.user._id,
	});
	brand.save((error, brand) => {
		if (error) return res.status(400).json({ error });
		if (brand) {
			res.status(201).json({ brand });
		}
	});
};
