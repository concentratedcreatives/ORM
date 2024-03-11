const router = require('express').Router();
const { Tag, Product } = require('../../models');

router.get('/', async (req, res) => {
  try {
    const tags = await Tag.findAll({
      attributes: ['tag_name'],
      include: [{ model: Product, attributes: ['product_name'] }]
    });
    res.json(tags);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, attributes: ['product_name', 'price', 'stock', 'category_id'], through: "ProductTag" }]
    });
    res.json(tag);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    const newTag = await Tag.create({ tag_name: req.body.tag_name });
    res.json(newTag);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    await Tag.update({ tag_name: req.body.tag_name }, { where: { id: req.params.id } });
    res.json({ message: `Tag with id ${req.params.id} updated successfully.` });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedTag = await Tag.destroy({ where: { id: req.params.id } });
    if (deletedTag) {
      res.json({ message: `Tag with id ${req.params.id} deleted successfully.` });
    } else {
      res.status(404).json({ message: `Tag with id ${req.params.id} not found.` });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
