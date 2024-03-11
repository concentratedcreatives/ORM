const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: ['product_name', 'price', 'stock'],
      include: [
        { model: Tag, attributes: ['tag_name'], through: ProductTag },
        { model: Category, attributes: ['category_name'] }
      ]
    });
    res.json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Tag, attributes: ['tag_name'], through: ProductTag },
        { model: Category, attributes: ['category_name'] }
      ]
    });
    res.json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTags = req.body.tagIds.map(tag_id => ({ product_id: newProduct.id, tag_id }));
      await ProductTag.bulkCreate(productTags);
    }
    res.status(200).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    await Product.update(req.body, { where: { id: req.params.id } });
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTags = await ProductTag.findAll({ where: { product_id: req.params.id } });
      const currentTagIds = productTags.map(({ tag_id }) => tag_id);
      const newTagIds = req.body.tagIds.filter(tag_id => !currentTagIds.includes(tag_id));
      const productTagsToRemove = productTags.filter(({ tag_id }) => !req.body.tagIds.includes(tag_id)).map(({ id }) => id);
      await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newTagIds.map(tag_id => ({ product_id: req.params.id, tag_id })))
      ]);
    }
    res.status(200).json(await Product.findByPk(req.params.id));
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Product.destroy({ where: { id: req.params.id } });
    res.json(`Product with id ${req.params.id} deleted.`);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;