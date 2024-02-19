<script lang="ts">
    import tsIcon from "$lib/icons/ts.svg?raw";
    import srcIcon from "$lib/icons/src.svg?raw";

    let request: IDBOpenDBRequest;
    let db: IDBDatabase | undefined = $state();

    let {
        data = {} as { "!root": Map<any, any> },
    } = $props();

    type FileInfo = {
        name: string;
        type: string;
        path: string;
        level: number;
        draft: boolean;
    }

    let workspace = $state(data["!root"]);
    let mainRoot: Map<any,any> = $derived(workspace.get("workspace"));
    let explorer: FileInfo[] = $state([]);
    let expanded_dirs: string[] = $state([]);
    let selectedElement: HTMLElement;
    
    $effect(() => {
        request = window.indexedDB.open("ZkodeFileSystem", 1);

        request.onsuccess = (event) => {
            const target = event.target as IDBOpenDBRequest;
            db = target.result;

            const transaction = db.transaction("files", "readwrite");
            const objectStore = transaction.objectStore("files")

            const res = objectStore.get("!root");

            res.onsuccess = (event) => {
                const d = (event.target as IDBOpenDBRequest).result;

                if (!d) {
                    const map = data["!root"];
                    objectStore.add(map, "!root");
                    
                    workspace = map;
                } else {
                    if (d instanceof Map) workspace = d;
                }

                explorer = renderMap(mainRoot);
            }
        }
        
        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const target = event.target as IDBOpenDBRequest;
            db = target.result;

            if (db) {
                db.createObjectStore("files", {
                    autoIncrement: true
                });
            }
        }
        
        return () => db?.close();
    });

    function isObjectInArray(path: string) {
        const array = expanded_dirs;

        if (array.length === 0) return false;
        
        return array.some(item => item === path);
    }

    function renderMap(map: Map<any,any>, path = "") {
        let elements: FileInfo[] = [];

        map.forEach((value, key: string) => {
            if (value instanceof Map) {
                const info = value.get("0");

                path = (path === "") ? path.concat(key) : path.concat("/", key);
                
                let element: FileInfo = {
                    name: key,
                    type: info.type,
                    path: path,
                    level: (path.includes("/")) ? path.split("/").length : 1,
                    draft: false
                }

                elements.push(element);
                
                if (isObjectInArray(path)) {
                    const nestedElements = renderMap(value, path);
                    elements.push(...nestedElements);
                }
            }
        });
        
        return elements;
    }

    function expand_dir(event: MouseEvent) {
        const element = event.currentTarget as HTMLElement;
        const path = element.dataset.path;

        let b = element.getAttribute("aria-expand");

        if (!path) return;
        const item = explorer.find((value) => path === value.path);
        
        if (item && item.draft === true) return;

        if (b === "true") {
            expanded_dirs.splice(expanded_dirs.indexOf(path), 1);
            explorer = renderMap(mainRoot);

            element.setAttribute("aria-expand", "false");
        } else {
            expanded_dirs.push(path);
            explorer = renderMap(mainRoot);

            element.setAttribute("aria-expand", "true");
        }

        if (selectedElement && selectedElement !== element) {
            selectedElement.setAttribute("aria-selected", "false");
            element.setAttribute("aria-selected", "true");

            selectedElement = element;
        } else if (!selectedElement) {
            element.setAttribute("aria-selected", "true");

            selectedElement = element;
        }
    }

    function expand_dir_keyboard(event: KeyboardEvent) {
        if (event.key === "Enter") {
            const element = event.currentTarget as HTMLElement;
            const path = element.dataset.path;

            console.log(path);
        }
    }
    
    function add_draft(parts: string[]) {
        
    }

    function add_file() {
        let path: string | undefined = "";
        
        if (selectedElement) path = selectedElement.dataset.path;
        if (path === undefined) return;

        if (path != "" && path.includes("/")) {
            let parts = path.split("/");

            if (parts.at(parts.length - 1)?.includes(".")) {
                parts = parts.slice(0, parts.length - 1);

                path = (parts.length > 1) ? parts.join("/") : parts.join("");
            }
        }

        const index = explorer.findIndex((value) => value.path === path);

        if (index >= 0) {
            const dir = explorer[index];
        
            explorer.splice(index + 1, 0, {
                type: "file",
                path: path.concat("/?"),
                name: "",
                level: dir.level + 1,
                draft: true
            });
        } else {
            explorer.splice(0, 0, {
                type: "file",
                path: path.concat("?"),
                name: "",
                level: 1,
                draft: true
            });
        }
    }
</script>

<div class="flex flex-col">
    <div class="flex items-center w-full h-10 py-3 px-4">
        <h2 class="text-neutral-300 uppercase">Explorer</h2>
        <button class="flex items-center justify-center p-2 ml-auto rounded hover:bg-[#2a2d2e]">
            <i class="text-white text-lg fi fi-rr-menu-burger"></i>
        </button>
    </div>
    <div>
        <div class="flex items-center px-4">
            <div class="flex items-center">
                <h3 class="font-bold text-white">WORKSPACES</h3>
            </div>
            <div class="flex items-center ml-auto">
                <button onclick={add_file} class="flex items-center justify-center p-2 rounded hover:bg-[#2a2d2e]">
                    <i class="text-white text-lg fi fi-rr-add-document"></i>
                </button>
                <button class="flex items-center justify-center p-2 ml-1 rounded hover:bg-[#2a2d2e]">
                    <i class="text-white text-lg fi fi-rr-add-folder"></i>
                </button>
            </div>
        </div>
        <div class="flex flex-col mt-3" role="tree">
            {#each explorer as file}
                {#if file.type === "dir"}
                    {#if file.draft === false}
                        <div aria-expanded="false" role="treeitem" aria-selected="false" aria-label={file.path} aria-level={file.level} data-path={file.path} tabindex="0" onclick={expand_dir} onkeydown={expand_dir_keyboard} class="flex flex-col aria-selected:bg-[#37373d] focus:!bg-[#04395e] hover:bg-[#2a2d2e]">
                            <div class="flex items-center py-1 pr-3 cursor-pointer" style="padding-left: {1.25 * file.level}rem;">
                                {@html srcIcon}
                                <h3 class="ml-2 text-sm text-gray-300">{file.name}</h3>
                            </div>
                        </div>
                    {:else}
                        <div aria-expanded="false" role="treeitem" aria-selected="false" aria-label={file.path} aria-level={file.level} data-path={file.path} tabindex="0" onclick={expand_dir} onkeydown={expand_dir_keyboard} class="flex flex-col aria-selected:bg-[#37373d] focus:!bg-[#04395e] hover:bg-[#2a2d2e]">
                            <div class="flex items-center py-1 pr-3 cursor-pointer" style="padding-left: {1.25 * file.level}rem;">
                                {@html srcIcon}
                                <input type="text">
                            </div>
                        </div>
                    {/if}
                {:else}
                    {#if file.draft === false}
                        <div role="treeitem" aria-selected="false" aria-label={file.path} aria-level={file.level} data-path={file.path} tabindex="0" onclick={expand_dir} onkeydown={expand_dir_keyboard} class="flex flex-col aria-selected:bg-[#37373d] focus:!bg-[#04395e] hover:bg-[#2a2d2e]">
                            <div class="flex items-center py-1 pr-3 cursor-pointer" style="padding-left: {1.25 * file.level}rem;">
                                {@html tsIcon}
                                <h3 class="ml-2 text-sm text-gray-300">{file.name}</h3>
                            </div>
                        </div>
                    {:else}
                        <div aria-expanded="false" role="treeitem" aria-selected="false" aria-label={file.path} aria-level={file.level} data-path={file.path} tabindex="0" onclick={expand_dir} onkeydown={expand_dir_keyboard} class="flex flex-col aria-selected:bg-[#37373d] focus:!bg-[#04395e] hover:bg-[#2a2d2e]">
                            <div class="flex items-center py-1 pr-3 cursor-pointer" style="padding-left: {1.25 * file.level}rem;">
                                {@html tsIcon}
                                <input onblur={() => console.log(explorer.findIndex((value) => file.path === value.path))} type="text">
                            </div>
                        </div>
                    {/if}
                {/if}
            {/each}
        </div>
    </div>
</div>

<style>
    i {
        display: flex;
        align-items: center;
    }
</style>