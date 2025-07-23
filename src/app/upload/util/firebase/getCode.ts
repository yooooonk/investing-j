import { db } from "@/lib/firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const STOCKS_COLLECTION = "stocks";

export async function fetchCodesByNames(stocksNameList: string[]) {
  console.log(1);
  const nameToCode: Record<string, string> = {};

  for (let i = 0; i < stocksNameList.length; i += 10) {
    console.log(2);
    const chunk = stocksNameList.slice(i, i + 10);
    const q = query(
      collection(db, STOCKS_COLLECTION),
      where("name", "in", chunk)
    );

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (typeof data.name === "string" && typeof data.code === "string") {
        nameToCode[data.name] = data.code;
      }
    });
  }
  return nameToCode;
}
