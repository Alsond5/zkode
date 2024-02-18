<script lang="ts">
    import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api"
    import FileExplorer from "$lib/components/fileExplorer.svelte";
    import workerURL from "$lib/worker?url";
	
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

            if (editorContainer) editor = monaco.editor.create(editorContainer, {
                fontFamily: "Hack",
                theme: "vs-dark",
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
</svelte:head>

<div class="flex w-full h-screen">
    <div class="flex flex-col flex-none w-14 bg-[#333333]">
        <div class="flex flex-col items-center mt-20">
            <button class="action-item flex items-center justify-center w-14 h-14 rounded"><i aria-selected="true" class="aria-selected:text-white flex items-center text-3xl text-[#ffffff80] fi fi-rr-duplicate"></i></button>
            <button class="action-item flex items-center justify-center w-14 h-14 rounded"><i aria-selected="false" class="aria-selected:text-white flex items-center text-3xl text-[#ffffff80] fi fi-brands-typescript"></i></button>
            <button class="action-item flex items-center justify-center w-14 h-14 rounded">
                <svg width="47" height="47" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" xml:space="preserve">
                    <path aria-selected="false" fill="#ffffff80" d="M16 24c.3 0 .5-.1.7-.2.2-.2.3-.4.3-.7l.2-1.2q-1.2.3-2.4 0l.2 1.2c0 .3.1.5.3.7.2.1.4.2.7.2m6.9-.2h1.9V12.9c0-1.5-.7-2.5-1.9-2.9zm-15.7 0h1.9V10c-1.2.4-1.9 1.4-1.9 2.9zm10-1.9c1.2-.3 2.1-1.2 2.3-2.8l1.2-9.2c-1.4.3-2.1 1.4-2.4 3.1zm-2.4 0L13.7 13c-.2-1.7-1-2.8-2.3-3.1l1.2 9.2c.2 1.6 1 2.5 2.2 2.8M22.9 10v-.8c0-.8-.4-1.2-1-1.2s-1 .4-1.1 1.1l-.1.8c.7-.1 1.5-.1 2.2.1M9.1 10c.4-.1.9-.2 1.3-.2.3 0 .6 0 1 .1l-.1-.8c-.2-.8-.6-1.1-1.2-1.1s-1 .4-1 1.2z"/>
                </svg>
            </button>
        </div>
    </div>
    <div class="flex-initial w-80 bg-[#252526]">
        <FileExplorer data={data} />
    </div>
    <div class="flex flex-col flex-1 min-w-[230px] h-full">
        <div class="flex items-center w-full h-10 bg-[#252526] px-3">
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
    
    .action-item:hover svg path {
        fill: white !important;
    }

    .action-item svg path[aria-selected="true"] {
        fill: white !important;
    }
</style>