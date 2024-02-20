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

    let newItem: HTMLInputElement | undefined = $state();
    
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

    $effect(() => {
        if (newItem) newItem.focus();
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

                let newPath = (path === "") ? path.concat(key) : path.concat("/", key);
                
                let element: FileInfo = {
                    name: key,
                    type: info.type,
                    path: newPath,
                    level: (newPath.includes("/")) ? newPath.split("/").length : 1,
                    draft: false
                }

                elements.push(element);
                
                if (isObjectInArray(newPath)) {
                    const nestedElements = renderMap(value, newPath);
                    elements.push(...nestedElements);
                }
            }
        });
        
        return elements;
    }

    async function handle_select(event: MouseEvent) {
        const element = event.currentTarget as HTMLElement;
        const path = element.dataset.path;

        const item = explorer.find((value) => path === value.path);

        if (!item || !path) return;

        select_item(item, path, element);
    }

    async function handle_focus(event: FocusEvent) {
        const element = event.currentTarget as HTMLElement;
        
        if (selectedElement && selectedElement !== element) {
            selectedElement.setAttribute("aria-selected", "false");
        }

        selectedElement = element;
    }

    async function handle_select_keyboard(event: KeyboardEvent) {
        if (event.key === "Enter") {
            const element = event.currentTarget as HTMLElement;
            const path = element.dataset.path;

            const item = explorer.find((value) => path === value.path);

            if (!item || !path) return;

            select_item(item, path, element);
        }
    }

    function select_item(item: FileInfo, path: string, element: HTMLElement) {
        if (item.type === "dir") {
            let isExpanded = element.getAttribute("aria-expanded");

            if (isExpanded === "true") collapse_dir(path, element);
            else if (isExpanded === "false") expand_dir(path, element);
        }

        if (selectedElement && selectedElement !== element) {
            selectedElement.setAttribute("aria-selected", "false");
            
            selectedElement = element;
            element.setAttribute("aria-selected", "true");
        }
    }

    function expand_dir(path: string, element: HTMLElement) {
        expanded_dirs.push(path);
        explorer = renderMap(mainRoot);

        element.setAttribute("aria-expanded", "true");
    }

    function collapse_dir(path: string, element: HTMLElement) {
        expanded_dirs.splice(expanded_dirs.indexOf(path), 1);
        explorer = renderMap(mainRoot);

        element.setAttribute("aria-expanded", "false");
    }
    
    function add_draft(parts: string[]) {
        
    }

    function add_file() {
        let path: string | undefined;
        
        if (selectedElement) path = selectedElement.dataset.path;
        if (path === undefined || path === "workspace") {
            explorer.splice(0, 0, {
                type: "file",
                path: "?",
                name: "",
                level: 1,
                draft: true
            });

            return;
        }

        let isExpanded = selectedElement.getAttribute("aria-expanded");
        let selectedElementPath = selectedElement.dataset.path || "";

        if (isExpanded === "false") expand_dir(selectedElementPath, selectedElement);

        if (path.includes("/")) {
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
        }
    }

    function handle_item_blur() {
        if (!newItem) return;

        const path = newItem.dataset.path;
        
        if (newItem.value === "" || !path) {
            explorer = renderMap(mainRoot);
            
            return;
        }

        const index = explorer.findIndex((value) => path === value.path);
        if (index < 0) {
            explorer = renderMap(mainRoot);
            
            return;
        }

        const item = explorer[index];
        const parts = (path.includes("/")) ? path.split("/") : ["?"];
        const name = newItem.value;

        let map = mainRoot;

        parts.forEach((value, index) => {
            if (value === "?") map.set(name, new Map().set("0", {
                type: item.type,
                size: 0,
                ino: 2
            }));
            else map = map.get(value);
        });

        explorer = renderMap(mainRoot);
    }
</script>

<div class="flex flex-col h-full">
    <div class="flex items-center w-full h-10 py-3 px-5">
        <h2 class="text-neutral-300 uppercase">Explorer</h2>
        <button class="flex items-center justify-center p-2 ml-auto rounded hover:bg-[#262a31]">
            <i class="text-white text-lg fi fi-rr-menu-burger"></i>
        </button>
    </div>
    <div class="flex flex-col h-full">
        <div class="flex items-center px-5">
            <div class="flex items-center">
                <h3 class="font-bold text-white">WORKSPACES</h3>
            </div>
            <div class="flex items-center ml-auto">
                <button onclick={add_file} class="flex items-center justify-center p-2 rounded hover:bg-[#262a31]">
                    <i class="text-white text-lg fi fi-rr-add-document"></i>
                </button>
                <button class="flex items-center justify-center p-2 ml-1 rounded hover:bg-[#262a31]">
                    <i class="text-white text-lg fi fi-rr-add-folder"></i>
                </button>
            </div>
        </div>
        <div class="flex flex-col w-full h-full mt-3 select-none border border-transparent focus:border-blue-500" tabindex="0" onfocus={handle_focus} role="tree" data-path="workspace">
            {#each explorer as file}
                <div class="flex flex-col border border-transparent aria-selected:bg-[#2c313a] outline-none focus:!border-blue-500 hover:bg-[#262a31]" aria-expanded="false" role="treeitem" aria-selected="false" aria-label={file.path} aria-level={file.level} data-path={file.path} tabindex="0" onclick={handle_select} onkeydown={handle_select_keyboard}>
                    <div class="flex items-center cursor-pointer h-7" style="padding-left: {1.25 * file.level}rem;">
                        {@html (file.type === "dir") ? srcIcon : tsIcon}
                        {#if file.draft === false}
                            <h3 class="ml-2 text-sm text-white">{file.name}</h3>
                        {:else}
                            <input class="ml-2 text-sm text-white w-full h-full outline-none border border-[#04395e] bg-transparent" data-path={file.path} bind:this={newItem} onblur={handle_item_blur} type="text" name="" id="">
                        {/if}
                    </div>
                </div>
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