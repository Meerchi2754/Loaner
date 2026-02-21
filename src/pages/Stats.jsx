import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { db } from "../db/appDB";
const Stats = () => {
  //   const [categoriesList, setCategoriesList] = useState([]);

  //   useEffect(() => {
  //     let mounted = true;
  //     (async () => {
  //       try {
  //         const tx = await db.categories.toArray();
  //         console.log("Loaded transactions:", tx);
  //         if (mounted) setCategoriesList(tx);
  //       } catch (err) {
  //         console.error("Failed to load transactions:", err);
  //       }
  //     })();
  //     return () => {
  //       mounted = false;
  //     };
  //   }, []);

  //   console.log("Categories list in Stats component:", categoriesList);

  //   // const categories = useSelector((state) => state.transactions.categories);
  //   // console.log("Categories in Stats component:", categories);

  //   if (!categoriesList || categoriesList.length === 0) {
  //     return <div>No Categories Found</div>;
  //   }
  return (
    <div>
      {/* <h1>Categories</h1>
      <ul>
        {categoriesList.map((category) => (
          <li key={category.id}>{category.name}</li>
        ))}
      </ul> */}
    </div>
  );
};

export default Stats;
