class APIFeatures {
	constructor(mongooseQuery, expressQuery, resourceLength) {
		this.mongooseQuery = mongooseQuery;
		this.expressQuery = expressQuery;
		this.resourceLength = resourceLength;
	}

	filter() {
		// 1A) basic filter
		const queryObj = { ...this.expressQuery };
		const excludedFields = ['limit', 'sort', 'fields', 'page'];
		excludedFields.forEach((el) => delete queryObj[el]);

		// 1B) advanced filter
		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(
			/\b(gte|gt|lte|le)\b/g,
			(match) => `$${match}`
		);

		this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

		return this;
	}

	sort() {
		// 2) sorting
		if (this.expressQuery.sort) {
			const sortBy = this.expressQuery.sort.split(',').join(' ');
			this.mongooseQuery = this.mongooseQuery.sort(sortBy);
		} else {
			this.mongooseQuery = this.mongooseQuery.sort('-createAt');
		}

		return this;
	}

	limitFields() {
		// 3) limiting fields
		if (this.expressQuery.fields) {
			const fieldsStr = this.expressQuery.fields.split(',').join(' ');
			this.mongooseQuery = this.mongooseQuery.select(fieldsStr);
		} else {
			this.mongooseQuery = this.mongooseQuery.select('-__v');
		}

		return this;
	}

	paginate() {
		// 4) paging and limiting documents
		const page = this.expressQuery.page * 1 || 1;
		const limit = this.expressQuery.limit * 1 || this.resourceLength;
		const skip = (page - 1) * limit;

		this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

		return this;
	}
}

module.exports = APIFeatures;
