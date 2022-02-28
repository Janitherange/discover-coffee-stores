// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { fetchCoffeeStores } from "../../lib/coffee-stores";

const getCoffeeStoreByLocation = async (req, res) => {
  try {
    const { latLong, limit } = req.query;
    const response = await fetchCoffeeStores(latLong, limit);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export default getCoffeeStoreByLocation;
