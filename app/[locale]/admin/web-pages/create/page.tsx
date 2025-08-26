import { Metadata } from "next";
import WebPageForm from "../web-page-form";

export const metadata: Metadata = {
  title: "Create WebPage",
};

export default function CreateWebPagePage() {
  return (
    <div className="max-w-6xl mx-auto p-4 bg-card shadow-md rounded-lg backdrop-blur-md">
      <h1 className="h1-bold">Create WebPage</h1>

      <div className="my-8">
        <WebPageForm type="Create" />
      </div>
    </div>
  );
}
