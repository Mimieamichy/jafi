const { writeToString } = require('@fast-csv/format');

exports.exportTableData = async (model, filename, res) => {
    const data = await model.findAll();
    const jsonData = data.map(item => item.toJSON());


    if (jsonData.length === 0) {
      return res.status(404).json({ message: `No ${filename} data found` });
    }

    const csv = await writeToString(jsonData, { headers: true }); 

    return csv
  
};
