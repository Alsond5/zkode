self.onmessage = (event) => {
    const userCode = event.data;

    try {
        eval(userCode);
        self.postMessage("user code executed")
    } catch (error) {
        self.postMessage("Error:" + error);
    }
}