import { AvailableBlock } from "../types/page-editor";
import { promises as fs } from "fs";
import path from "path";

function toPascalCase(input: string): string {
  return input
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export class ComponentRepository {
  private components: AvailableBlock[] = [];
  private static instance: ComponentRepository;
  private widgetsRoot = path.join(
    process.cwd(),
    "../../",
    "packages",
    "components",
    "widgets",
  );

  constructor() {
    this.components = [];
  }

  public async fetchComponents(
    force: boolean = false,
  ): Promise<AvailableBlock[]> {
    if (this.components.length > 0 && !force) {
      return this.components;
    }

    const discovered: AvailableBlock[] = [];

    const walk = async (
      dirAbsolutePath: string,
      relativeFromWidgets: string = "",
    ): Promise<void> => {
      const entries = await fs.readdir(dirAbsolutePath, {
        withFileTypes: true,
      });

      for (const entry of entries) {
        const entryAbsolutePath = path.join(dirAbsolutePath, entry.name);
        const entryRelativePath = path.posix.join(
          // Ensure POSIX-style separators for import paths
          relativeFromWidgets.replace(/\\/g, "/"),
          entry.name,
        );

        if (entry.isDirectory()) {
          await walk(entryAbsolutePath, entryRelativePath);
          continue;
        }

        // Only consider .tsx files, skip any index.tsx files
        if (!entry.name.endsWith(".tsx")) continue;
        if (/^index\.tsx?$/i.test(entry.name)) continue;

        const withoutExt = entryRelativePath.replace(/\.tsx?$/i, "");

        // Determine componentName from the file name without extension (PascalCase)
        const fileBaseName = path.posix.basename(withoutExt);
        const componentName = toPascalCase(fileBaseName);

        // Determine group: first folder under widgets if present
        const segments = withoutExt.split("/");
        const group = segments.length > 1 ? segments[0] : undefined;

        // Build import string using the components alias root
        const importString = `import ${componentName} from '@/components/widgets/${withoutExt}';`;

        discovered.push({
          type: componentName,
          label: componentName,
          componentName,
          importString,
          ...(group ? { group } : {}),
        });
      }
    };

    try {
      await walk(this.widgetsRoot);
    } catch (error) {
      // If the folder does not exist or cannot be read, keep an empty list
      console.error("Failed to scan widgets components", error);
    }

    this.components = discovered;
    return discovered;
  }
  public async getComponentFileContent(relativePath: string): Promise<{
    path: string;
    content: string;
    lastModified: string;
  }> {
    const decodedPath = decodeURIComponent(relativePath);

    if (decodedPath.includes("..") || decodedPath.includes("~")) {
      throw new Error("Invalid path");
    }

    const fullPath = path.join(this.widgetsRoot, decodedPath);

    if (!fullPath.endsWith(".tsx")) {
      throw new Error("Only .tsx files are supported");
    }

    try {
      const content = await fs.readFile(fullPath, "utf-8");
      const stats = await fs.stat(fullPath);

      return {
        path: decodedPath,
        content,
        lastModified: stats.mtime.toISOString(),
      };
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        throw new Error("File not found");
      }
      throw error;
    }
  }

  public async updateComponentFile(
    relativePath: string,
    content: string,
  ): Promise<{
    path: string;
    content: string;
    lastModified: string;
    message: string;
  }> {
    if (!content || typeof content !== "string") {
      throw new Error("Content is required and must be a string");
    }

    const decodedPath = decodeURIComponent(relativePath);

    if (decodedPath.includes("..") || decodedPath.includes("~")) {
      throw new Error("Invalid path");
    }

    const fullPath = path.join(this.widgetsRoot, decodedPath);

    if (!fullPath.endsWith(".tsx")) {
      throw new Error("Only .tsx files are supported");
    }

    try {
      const dirPath = path.dirname(fullPath);
      await fs.mkdir(dirPath, { recursive: true });

      await fs.writeFile(fullPath, content, "utf-8");

      const stats = await fs.stat(fullPath);

      this.components = [];

      return {
        path: decodedPath,
        content,
        lastModified: stats.mtime.toISOString(),
        message: "File updated successfully",
      };
    } catch (error) {
      throw new Error(
        `Failed to update component: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  public async deleteComponentFile(relativePath: string): Promise<{
    message: string;
    path: string;
  }> {
    const decodedPath = decodeURIComponent(relativePath);

    if (decodedPath.includes("..") || decodedPath.includes("~")) {
      throw new Error("Invalid path");
    }

    const fullPath = path.join(this.widgetsRoot, decodedPath);

    if (!fullPath.endsWith(".tsx")) {
      throw new Error("Only .tsx files are supported");
    }

    try {
      await fs.unlink(fullPath);

      this.components = [];

      return {
        message: "File deleted successfully",
        path: decodedPath,
      };
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        throw new Error("File not found");
      }
      throw error;
    }
  }

  public static getInstance(): ComponentRepository {
    if (!ComponentRepository.instance) {
      ComponentRepository.instance = new ComponentRepository();
    }
    return ComponentRepository.instance;
  }
}
