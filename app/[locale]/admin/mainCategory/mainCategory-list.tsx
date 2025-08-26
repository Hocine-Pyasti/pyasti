"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DeleteDialog from "@/components/shared/delete-dialog";
import {
  deleteMainCategory,
  getAllMainCategories,
} from "@/lib/actions/mainCategory.actions";
import { IMainCategory } from "@/lib/db/models/mainCategory.model";
import { formatDateTime, formatId } from "@/lib/utils";

type MainCategoryListDataProps = {
  mainCategories: IMainCategory[];
  totalPages: number;
  totalMainCategories: number;
  to: number;
  from: number;
};

const MainCategoryList = () => {
  const [page, setPage] = useState<number>(1);
  const [inputValue, setInputValue] = useState<string>("");
  const [data, setData] = useState<MainCategoryListDataProps>();
  const [isPending, startTransition] = useTransition();

  const handlePageChange = (changeType: "next" | "prev") => {
    const newPage = changeType === "next" ? page + 1 : page - 1;
    setPage(newPage);
    startTransition(async () => {
      const data = await getAllMainCategories({
        query: inputValue,
        page: newPage,
      });
      setData(data);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value) {
      clearTimeout((window as any).debounce);
      (window as any).debounce = setTimeout(() => {
        startTransition(async () => {
          const data = await getAllMainCategories({ query: value, page: 1 });
          setData(data);
        });
      }, 500);
    } else {
      startTransition(async () => {
        const data = await getAllMainCategories({ query: "", page });
        setData(data);
      });
    }
  };

  useEffect(() => {
    startTransition(async () => {
      const data = await getAllMainCategories({ query: "" });
      setData(data);
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 bg-card shadow-md rounded-lg backdrop-blur-md">
      <div className="space-y-4">
        <div className="flex justify-between flex-wrap gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-bold text-lg">Main Categories</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                className="w-auto max-w-xs"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Filter name..."
              />
              {isPending ? (
                <p>Loading...</p>
              ) : (
                <p>
                  {data?.totalMainCategories === 0
                    ? "No"
                    : `${data?.from}-${data?.to} of ${data?.totalMainCategories}`}
                  {" results"}
                </p>
              )}
            </div>
          </div>
          <Button asChild variant="default">
            <Link href="/admin/mainCategory/create">Create Main Category</Link>
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Last Update</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.mainCategories.map((mainCategory: IMainCategory) => (
              <TableRow key={mainCategory._id}>
                <TableCell>{formatId(mainCategory._id)}</TableCell>
                <TableCell>
                  <Link href={`/admin/mainCategory/${mainCategory._id}`}>
                    {mainCategory.name}
                  </Link>
                </TableCell>
                <TableCell>{mainCategory.description || "-"}</TableCell>
                <TableCell>
                  {formatDateTime(mainCategory.updatedAt).dateTime}
                </TableCell>
                <TableCell className="flex gap-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/mainCategory/${mainCategory._id}`}>
                      Edit
                    </Link>
                  </Button>
                  <DeleteDialog
                    id={mainCategory._id}
                    action={deleteMainCategory}
                    callbackAction={() => {
                      startTransition(async () => {
                        const data = await getAllMainCategories({
                          query: inputValue,
                        });
                        setData(data);
                      });
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {(data?.totalPages ?? 0) > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange("prev")}
              disabled={page <= 1}
              className="w-24"
            >
              <ChevronLeft /> Previous
            </Button>
            <p>
              Page {page} of {data?.totalPages}
            </p>
            <Button
              variant="outline"
              onClick={() => handlePageChange("next")}
              disabled={page >= (data?.totalPages ?? 0)}
              className="w-24"
            >
              Next <ChevronRight />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainCategoryList;
