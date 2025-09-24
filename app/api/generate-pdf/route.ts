import { NextResponse } from "next/server";
import { execSync } from "child_process";
import { writeFileSync, unlinkSync, copyFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

export async function POST(request: Request) {
  try {
    const { latexContent, fileName } = await request.json();

    // Create temporary files
    const tempDir = tmpdir();
    const texFilePath = join(tempDir, `${fileName}.tex`);
    const pdfFilePath = join(tempDir, `${fileName}.pdf`);
    const logoFilePath = join(tempDir, `logo.png`);

    // Copy logo.png from public to temp directory
    const publicLogoPath = join(process.cwd(), "public", "logo.png");
    copyFileSync(publicLogoPath, logoFilePath);

    // Write LaTeX content to a .tex file
    writeFileSync(texFilePath, latexContent);

    // Run latexmk to generate PDF
    execSync(`latexmk -pdf -output-directory=${tempDir} ${texFilePath}`, {
      stdio: "inherit",
    });

    // Read the generated PDF
    const pdfBuffer = require("fs").readFileSync(pdfFilePath);

    // Clean up temporary files
    unlinkSync(texFilePath);
    unlinkSync(pdfFilePath);
    unlinkSync(logoFilePath);
    const auxFiles = [
      ".aux",
      ".log",
      ".fls",
      ".fdb_latexmk",
      ".out",
      ".toc",
      ".synctex.gz",
    ];
    auxFiles.forEach((ext) => {
      try {
        unlinkSync(join(tempDir, `${fileName}${ext}`));
      } catch (e) {
        console.warn(`Failed to delete auxiliary file ${fileName}${ext}:`, e);
      }
    });

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
