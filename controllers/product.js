const prisma = require("../config/prisma");

exports.create = async (req, res) => {
  try {
    const { title, description, price, quantity, categoryId, images } =
      req.body;

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseInt(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        images: {
          create: images.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });

    res.send(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};

exports.list = async (req, res) => {
  try {
    const { count } = req.params;
    const product = await prisma.product.findMany({
      take: parseInt(count),
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: true,
      },
    });

    res.send(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};

exports.read = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findFirst({
      where: { id: parseInt(id) },
      include: {
        category: true,
        images: true,
      },
    });

    res.send(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const { title, description, price, quantity, categoryId, images } =
      req.body;

    await prisma.image.deleteMany({
      where: { id: parseInt(id) },
    });

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        price: parseInt(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        images: {
          create: images.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });

    res.send(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.send("Delete successfully!!");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};

exports.listBy = async (req, res) => {
  try {
    const { sort, order, limit } = req.body;

    const products = await prisma.product.findMany({
      take: limit,
      orderBy: { [sort]: order },
      include: { category: true },
    });

    res.send(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};

const handleQuery = async (req, res, query) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      include: {
        category: true,
        images: true,
      },
    });

    res.send(products);
  } catch (error) {
    console.error(error);
    res.status(500).send("Search Error");
  }
};
const handlePrice = async (req, res, priceRange) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        price: {
          gte: priceRange[0],
          lte: priceRange[1],
        },
      },
      include: {
        category: true,
        images: true,
      },
    });

    res.send(products);
  } catch (error) {
    console.error(error);
    res.status(500).send("Search Error");
  }
};
const handleCategory = async (req, res, categoryId) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId: {
          in: categoryId.map((id) => Number(id)),
        },
      },
      include: {
        category: true,
        images: true,
      },
    });

    res.send(products);
  } catch (error) {
    console.error(error);
    res.status(500).send("Search Error");
  }
};

exports.searchFilters = async (req, res) => {
  try {
    const { query, category, price } = req.body;

    if (query) {
      await handleQuery(req, res, query);
    }

    if (category) {
      await handleCategory(req, res, category);
    }

    if (price) {
      await handlePrice(req, res, price);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};
