<script lang="ts">
    import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api"

    let editor: Monaco.editor.IStandaloneCodeEditor | undefined = $state();
    let monaco: typeof Monaco;
    let editorContainer: HTMLElement | undefined = $state();

    let theme = $state("vs-dark");

    $effect(() => {
        import("./monaco").then(m => {
            monaco = m.default;
        }).then(() => {
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

            return () => {
                monaco.editor.getModels().forEach((model) => model.dispose());
                editor?.dispose();
            }
        });

        window.onresize = () => {
            editor?.layout();
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
</svelte:head>

<div class="flex w-full h-screen">
    <div class="flex flex-col flex-none w-14 bg-[#333333]">
        <div class="flex flex-col items-center mt-20">
            <button class="action-item flex items-center justify-center w-14 h-14 rounded"><i class="flex items-center text-3xl text-white fi fi-rr-duplicate"></i></button>
            <button class="action-item flex items-center justify-center w-14 h-14 rounded"><i class="flex items-center text-3xl fi fi-rr-duplicate"></i></button>
            <button class="action-item flex items-center justify-center w-14 h-14 rounded"><i class="flex items-center text-3xl fi fi-rr-duplicate"></i></button>
        </div>
    </div>
    <div class="flex-initial w-80 bg-[#252526]">

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
</style>