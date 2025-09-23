import { AvailableBlock } from "../types/page-editor";
import { promises as fs } from "fs";
import path from "path";

function toPascalCase(input: string): string {
    return input
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
}

export class ComponentRepository {
    private components: AvailableBlock[] = [];
    private static instance: ComponentRepository;
    constructor() {
        this.components = [];
    }

    public async fetchComponents(force: boolean = false): Promise<AvailableBlock[]> {
        if (this.components.length > 0 && !force) {
            return this.components;
        }
        const widgetsRoot = path.join(process.cwd(), '../../',"packages", "components", "widgets");

        const discovered: AvailableBlock[] = [];

        const walk = async (dirAbsolutePath: string, relativeFromWidgets: string = ""): Promise<void> => {
            const entries = await fs.readdir(dirAbsolutePath, { withFileTypes: true });

            for (const entry of entries) {
                const entryAbsolutePath = path.join(dirAbsolutePath, entry.name);
                const entryRelativePath = path.posix.join(
                    // Ensure POSIX-style separators for import paths
                    relativeFromWidgets.replace(/\\/g, "/"),
                    entry.name
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
                    ...(group ? { group } : {})
                });
            }
        };

        try {
            await walk(widgetsRoot);
        } catch (error) {
            // If the folder does not exist or cannot be read, keep an empty list
            console.error("Failed to scan widgets components", error);
        }

        this.components = discovered;
        return discovered;
    }
    public static getInstance(): ComponentRepository {
        if (!ComponentRepository.instance) {
            ComponentRepository.instance = new ComponentRepository();
        }
        return ComponentRepository.instance;
    }
}
