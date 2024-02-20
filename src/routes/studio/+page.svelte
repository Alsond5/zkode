<script lang="ts">
    import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api"
    import FileExplorer from "$lib/components/fileExplorer.svelte";
    import workerURL from "$lib/worker?url";

    import { themeSettings } from "$lib/themes/OneDark";
    import o1js from "o1js?raw";
    import zkapp from "../../../node_modules/o1js/dist/node/lib/zkapp?raw";

	let { data } = $props();

    let editor: Monaco.editor.IStandaloneCodeEditor | undefined = $state();
    let monaco: typeof Monaco;
    let editorContainer: HTMLElement | undefined = $state();

    let worker: Worker;
    
    $effect(() => {
        worker = new Worker(workerURL);

        worker.onmessage = (event) => {
            console.log(event.data);
        }

        return () => worker?.terminate();
    });

    $effect(() => {
        const loader = async () => {
            monaco = (await import("./monaco")).default;

            monaco.editor.defineTheme("atom-one-dark", themeSettings);

            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                target: monaco.languages.typescript.ScriptTarget.ES2020,
                allowNonTsExtensions: true,
                lib: ["dom", "esnext"],
                strict: true,
                strictPropertyInitialization: false,
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                module: monaco.languages.typescript.ModuleKind.CommonJS,
                noEmit: true,
                allowJs: true,
                declaration: true,
                allowSyntheticDefaultImports: true,
                skipLibCheck: true,
                forceConsistentCasingInFileNames: true,
                esModuleInterop: true,
                experimentalDecorators: true,
                emitDecoratorMetadata: true,
                noFallthroughCasesInSwitch: true,
                useDefineForClassFields: false
            });
            monaco.languages.typescript.typescriptDefaults.addExtraLib(
                o1js,
                "file:///C:/Users/ahmet/Desktop/projects/zkode/node_modules/o1js/dist/node/index.d.ts"
            );
            monaco.languages.typescript.typescriptDefaults.addExtraLib(
                zkapp,
                "file:///C:/Users/ahmet/Desktop/projects/zkode/node_modules/o1js/dist/node/lib/zkapp.d.ts"
            );

            if (editorContainer) editor = monaco.editor.create(editorContainer, {
                fontFamily: "Hack",
                theme: "atom-one-dark",
                lineHeight: 20
            });
            const model = monaco.editor.createModel(
                "// write code here",
                'typescript'
            );
            editor?.setModel(model);

            window.onresize = () => {
                editor?.layout();
            }
        }

        loader();

        return () => {
            monaco.editor.getModels().forEach((model) => model.dispose());
            editor?.dispose();
        }
    });

    function zoom_in() {
        const zoom_level = monaco.editor.EditorZoom.getZoomLevel() + 1;

        monaco.editor.EditorZoom.setZoomLevel(zoom_level);
    }

    function zoom_out() {
        const zoom_level = monaco.editor.EditorZoom.getZoomLevel() - 1;

        monaco.editor.EditorZoom.setZoomLevel(zoom_level);
    }
</script>

<svelte:head>
    <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.1.0/uicons-regular-rounded/css/uicons-regular-rounded.css'>
    <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.1.0/uicons-brands/css/uicons-brands.css'>
    <title>Zkode Studio</title>
</svelte:head>

<div class="flex w-full h-screen">
    <div class="flex flex-col flex-none w-14 bg-[#333842]">
        <div class="flex flex-col items-center mt-20">
            <button class="border-l-2 border-white action-item flex items-center justify-center w-14 h-14"><i aria-selected="true" class="aria-selected:text-white text-2xl fi fi-rr-folder-tree"></i></button>
            <button class="action-item flex items-center justify-center w-14 h-14">
                <svg width="24" height="26.7" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" class="node" d="M8.23481 19.7945C8.46962 19.9297 8.73561 20 9.00345 20L9.00271 19.9961C9.27374 19.9968 9.54014 19.9259 9.77502 19.7907L17.1019 15.5586C17.5752 15.2834 17.8705 14.7716 17.8705 14.2231V5.76619C17.8704 5.49581 17.7993 5.2302 17.6644 4.99586C17.5296 4.76152 17.3356 4.56666 17.1019 4.4307L9.77502 0.196746C9.31457 -0.0655823 8.69819 -0.0655823 8.23407 0.196746L0.898037 4.42886C0.42291 4.70036 0.129395 5.21401 0.129395 5.76435V14.2212C0.129583 14.4919 0.200641 14.7577 0.335495 14.9923C0.470349 15.227 0.664296 15.4222 0.898037 15.5586L2.82056 16.6666C3.75247 17.1252 4.08634 17.1252 4.5101 17.1252C5.88779 17.1252 6.68028 16.2905 6.68028 14.8376V6.48713C6.68028 6.36789 6.58488 6.27617 6.46931 6.27617H5.54107C5.42183 6.27617 5.32828 6.36789 5.32828 6.48713V14.834C5.32828 15.4797 4.66236 16.1218 3.57269 15.5769L1.56578 14.4175C1.49607 14.379 1.45205 14.302 1.45205 14.2212V5.76435C1.45205 5.68364 1.49717 5.60475 1.56817 5.5644L8.89246 1.33779C8.96034 1.29743 9.05023 1.29743 9.1181 1.33779L16.4439 5.5644C16.5132 5.60659 16.5572 5.6818 16.5572 5.76619V14.2231C16.5572 14.3038 16.5132 14.3827 16.4453 14.4212L9.11663 18.6515C9.05371 18.6882 8.9574 18.6882 8.88953 18.6515L7.00993 17.5361C6.95398 17.5031 6.88244 17.4921 6.82777 17.5233C6.3077 17.8186 6.20882 17.8572 5.72159 18.0278C5.60106 18.0694 5.42275 18.1417 5.78818 18.346L8.23481 19.7945ZM7.38817 11.4661C7.38817 12.7007 8.0605 14.1726 11.2672 14.1726L11.2565 14.1813C13.5789 14.1813 14.9108 13.2659 14.9108 11.6699C14.9108 10.0867 13.8413 9.6648 11.5886 9.36578C9.31381 9.06493 9.08267 8.909 9.08267 8.37517C9.08267 7.93489 9.27896 7.34786 10.9648 7.34786C12.4709 7.34786 13.0249 7.67256 13.2542 8.68703C13.2744 8.78242 13.3606 8.85213 13.4597 8.85213H14.4118C14.4413 8.85213 14.4705 8.846 14.4976 8.83414C14.5246 8.82228 14.5489 8.80494 14.5689 8.78322C14.5889 8.7615 14.6042 8.73587 14.6137 8.70794C14.6233 8.68002 14.627 8.65041 14.6246 8.62098C14.4778 6.8709 13.3148 6.0564 10.9685 6.0564C8.87904 6.0564 7.63161 6.93694 7.63161 8.41552C7.63161 10.0207 8.87171 10.4628 10.8786 10.6609C13.2781 10.8957 13.4652 11.2461 13.4652 11.7176C13.4652 12.5367 12.8085 12.8856 11.2638 12.8856C9.32482 12.8856 8.89922 12.3991 8.75613 11.4345C8.73962 11.3312 8.65157 11.2551 8.547 11.2551H7.60042C7.48283 11.2551 7.38817 11.3487 7.38817 11.4661Z" fill="#bcc8e0"/>
                </svg>
            </button>
            <button class="action-item flex items-center justify-center w-14 h-14">
                <svg width="41" height="41" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" xml:space="preserve">
                    <path aria-selected="false" fill="#bcc8e0" class="mina" d="M16 24c.3 0 .5-.1.7-.2.2-.2.3-.4.3-.7l.2-1.2q-1.2.3-2.4 0l.2 1.2c0 .3.1.5.3.7.2.1.4.2.7.2m6.9-.2h1.9V12.9c0-1.5-.7-2.5-1.9-2.9zm-15.7 0h1.9V10c-1.2.4-1.9 1.4-1.9 2.9zm10-1.9c1.2-.3 2.1-1.2 2.3-2.8l1.2-9.2c-1.4.3-2.1 1.4-2.4 3.1zm-2.4 0L13.7 13c-.2-1.7-1-2.8-2.3-3.1l1.2 9.2c.2 1.6 1 2.5 2.2 2.8M22.9 10v-.8c0-.8-.4-1.2-1-1.2s-1 .4-1.1 1.1l-.1.8c.7-.1 1.5-.1 2.2.1M9.1 10c.4-.1.9-.2 1.3-.2.3 0 .6 0 1 .1l-.1-.8c-.2-.8-.6-1.1-1.2-1.1s-1 .4-1 1.2z"/>
                </svg>
            </button>
        </div>
    </div>
    <div class="flex-initial w-80 bg-[#21252b]">
        <FileExplorer data={data}/>
    </div>
    <div class="flex flex-col flex-1 min-w-[230px] h-full">
        <div class="flex items-center w-full h-10 bg-[#21252b] px-3">
            <div class="flex items-center ml-auto">
                <button class="flex items-center justify-center text-[#c5c5c5] mx-3 w-7 h-7 rounded hover:bg-[#383a49]" onclick={zoom_out}><i class="flex items-center fi fi-rr-zoom-out"></i></button>
                <button class="flex items-center justify-center text-[#c5c5c5] w-7 h-7 rounded hover:bg-[#383a49]" onclick={zoom_in}><i class="flex items-center fi fi-rr-zoom-in"></i></button>
            </div>
        </div>
        <div class="w-full h-full">
            <div class="editor" bind:this={editorContainer}></div>
        </div>
    </div>
</div>

<style>
    .editor {
        width: 100%;
        height: 100%;
    }
    
    .action-item:hover i {
        color: white;
    }
    
    .action-item:hover svg .mina {
        fill: white !important;
    }

    .action-item svg path[aria-selected="true"] {
        fill: white !important;
    }

    i {
        display: flex;
        align-items: center;
        color: #ffffff80;
    }

    .action-item:hover svg .node {
        fill: #2DD4BF;
    }
</style>