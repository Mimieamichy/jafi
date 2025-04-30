const { writeToString } = require('@fast-csv/format');

exports.exportTableData = async (model, filename, res) => {
  try {
    const data = await model.findAll();
    const jsonData = data.map(item => item.toJSON());


    if (jsonData.length === 0) {
      return res.status(404).json({ message: `No ${filename} data found` });
    }

    const csv = await writeToString(jsonData);

    res.status(200).send(csv);
  } catch (error) {
    console.error(`Error exporting ${filename}:`, error);
    res.status(500).json({ message: `Failed to export ${filename}` });
  }
};
