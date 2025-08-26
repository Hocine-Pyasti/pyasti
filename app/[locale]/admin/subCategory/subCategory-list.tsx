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
  deleteSubCategory,
  getAllSubCategories,
} from "@/lib/actions/subCategory.actions";
import { ISubCategory } from "@/lib/db/models/subCategory.model";
import { formatDateTime, formatId } from "@/lib/utils";

type SubCategoryListDataProps = {
  subCategories: ISubCategory[];
  totalPages: number;
  totalSubCategories: number;
  to: number;
  from: number;
};

const SubCategoryList = () => {
  const [page, setPage] = useState<number>(1);
  const [inputValue, setInputValue] = useState<string>("");
  const [data, setData] = useState<SubCategoryListDataProps>();
  const [isPending, startTransition] = useTransition();

  const handlePageChange = (changeType: "next" | "prev") => {
    const newPage = changeType === "next" ? page + 1 : page - 1;
    setPage(newPage);
    startTransition(async () => {
      const data = await getAllSubCategories({
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
          const data = await getAllSubCategories({ query: value, page: 1 });
          setData(data);
        });
      }, 500);
    } else {
      startTransition(async () => {
        const data = await getAllSubCategories({ query: "", page });
        setData(data);
      });
    }
  };

  useEffect(() => {
    startTransition(async () => {
      const data = await getAllSubCategories({ query: "" });
      setData(data);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 bg-card shadow-md rounded-lg backdrop-blur-md ">
      <div className="space-y-4">
        <div className="flex justify-between flex-wrap gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-bold text-lg">Sub Categories</h1>
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
                  {data?.totalSubCategories === 0
                    ? "No"
                    : `${data?.from}-${data?.to} of ${data?.totalSubCategories}`}
                  {" results"}
                </p>
              )}
            </div>
          </div>
          <Button asChild variant="default">
            <Link href="/admin/subCategory/create">Create Sub Category</Link>
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Main Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Last Update</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.subCategories.map((subCategory: ISubCategory) => (
              <TableRow key={subCategory._id}>
                <TableCell>{formatId(subCategory._id)}</TableCell>
                <TableCell>
                  <Link href={`/admin/subCategory/${subCategory._id}`}>
                    {subCategory.name}
                  </Link>
                </TableCell>
                <TableCell>{subCategory.mainCategory?.name || "N/A"}</TableCell>
                <TableCell>{subCategory.description || "-"}</TableCell>
                <TableCell>
                  {formatDateTime(subCategory.updatedAt).dateTime}
                </TableCell>
                <TableCell className="flex gap-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/subCategory/${subCategory._id}`}>
                      Edit
                    </Link>
                  </Button>
                  <DeleteDialog
                    id={subCategory._id}
                    action={deleteSubCategory}
                    callbackAction={() => {
                      startTransition(async () => {
                        const data = await getAllSubCategories({
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

export default SubCategoryList;
