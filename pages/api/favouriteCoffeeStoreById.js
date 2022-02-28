import {
  table,
  findRecordByFilter,
  getMinifiedRecords,
} from "../../lib/airtable";

const favouriteCoffeeStoreById = async (req, res) => {
  if (req.method === "PUT") {
    try {
      const { id } = req.body;
      if (id) {
        const records = await findRecordByFilter(id);

        if (records.length !== 0) {
          const record = records[0];

          const calculateVoting = parseInt(record.voting) + 1;
          console.log(calculateVoting);

          //update a Record
          const updateRecord = await table.update([
            {
              id: record.recordId,
              fields: {
                voting: calculateVoting,
              },
            },
          ]);

          if (updateRecord) {
            const minifiedRecords = getMinifiedRecords(updateRecord);
            res.status(200).json(minifiedRecords);
          }
        } else {
          res.json({ message: "CoffeeStore id doesn't exist", id });
        }
      } else {
        res.status(400).json({ message: "CoffeeStore id is missing" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error up-voting coffee store", error });
    }
  }
};
export default favouriteCoffeeStoreById;
