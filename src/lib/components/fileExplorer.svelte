<script lang="ts">
    let request: IDBOpenDBRequest;
    let db: IDBDatabase | undefined = $state();

    let {
        data = {} as { "!root": Map<any, any> },
    } = $props();

    let root = $state(new Map());

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
                    
                    root = map;
                } else {
                    if (d instanceof Map) root = d;
                }
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
</script>

<div class="flex flex-col">
    <div class="flex items-center w-full h-10 py-3 px-5">
        <h2 class="text-neutral-300 uppercase">Explorer</h2>
        <button class="flex items-center justify-center p-2 ml-auto rounded hover:bg-[#2a2d2e]">
            <i class="text-gray-300 fi fi-rr-menu-burger"></i>
        </button>
    </div>
    <div>
        <div class="flex items-center px-5">
            <div class="flex items-center">
                <h3 class="font-bold text-white">WORKSPACES</h3>
            </div>
            <div class="flex items-center ml-auto">
                <button class="flex items-center justify-center p-2 rounded hover:bg-[#2a2d2e]">
                    <i class="text-gray-300 fi fi-rr-add-document"></i>
                </button>
                <button class="flex items-center justify-center p-2 ml-1 rounded hover:bg-[#2a2d2e]">
                    <i class="text-gray-300 fi fi-rr-add-folder"></i>
                </button>
            </div>
        </div>
        <div class="flex flex-col mt-3">
            <div class="flex flex-col">
                <div class="flex items-center hover:bg-[#2a2d2e] py-1 px-5 cursor-pointer">
                    <i class="text-slate-500 fi fi-rr-folder"></i>
                    <h3 class="ml-2 text-gray-300 text-sm">build</h3>
                </div>
            </div>
            <div class="flex flex-col">
                <div class="flex items-center hover:bg-[#2a2d2e] py-1 px-5 cursor-pointer">
                    <i class="text-slate-500 fi fi-rr-folder"></i>
                    <h3 class="ml-2 text-gray-300 text-sm">src</h3>
                </div>
                <div class="flex items-center hover:bg-[#2a2d2e] py-1 px-10 cursor-pointer">
                    <i class="text-blue-500 fi fi-brands-typescript"></i>
                    <h3 class="ml-2 text-gray-300 text-sm">Prover.ts</h3>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    i {
        display: flex;
        align-items: center;
    }
</style>