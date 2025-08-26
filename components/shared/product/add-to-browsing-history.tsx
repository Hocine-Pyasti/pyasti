"use client";
import useBrowsingHistory from "@/hooks/use-browsing-history";
import { useEffect } from "react";

export default function AddToBrowsingHistory({
  id,
  subCategory,
}: {
  id: string;
  subCategory: string;
}) {
  const { addItem } = useBrowsingHistory();
  useEffect(() => {
    addItem({ id, subCategory });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
