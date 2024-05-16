# Asset Management

API Asset management. Why I create this ?, Sometimes your Frontend require upload file feature but backend are not ready yet. So you can use this.

## How to run

1. Install [Deno](https://deno.com/) (Sorry, I love it)
2. Run `deno run -A main.ts`

## Feature 

API to manage your asset

`POST /asset`
Upload your asset

Here is example code js 
```ts
const onChooseImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const resApi = await fetch("http://localhost:6767/asset", {
      method: "POST",
      headers: {
      },
      body: formData,
    })
    const res: {
      message: string,
      uploadedFiles: {
        randomName: string,
        originalName: string,
        path: string,
      }[]
    } = await resApi.json();
    if (resApi.ok === false) {
      console.error(res);
      return null
    }
    return res.uploadedFiles[0].path;
} 
```

`GET /asset/:namefile`
This will return the file.

## Author

- [Rio Chandra](https://github.com/RioChndr)