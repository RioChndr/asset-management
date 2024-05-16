import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

const CONFIG = {
  dir: "./assets",
}

const router = new Router();

await ensureDir(CONFIG.dir);

router.post("/asset", async (context) => {
  console.log("Uploading file")
  console.log(context.request.originalRequest)

  const selfUrl = new URL(context.request.url);
  const body = context.request.body({ type: "form-data", })
  const form = await body.value.read({
    maxFileSize: 100 * 1024 * 1024, // 100MB
    // based the documentation, default is set 0
    // so, we have to set integer > 0 to enable read the content into memory
    // then we can do anything
    maxSize: 100 * 1024 * 1024, // 100MB
  })
  if (!form.files) {
    console.error("No files were uploaded")
    return context.response.body = {
      message: "No files were uploaded",
    }
  }

  const uploadedFiles = await Promise.allSettled(form.files?.map(async (file) => {
    const fileName = file.originalName;
    const fileExtension = fileName.split('.').pop();
    const uuid = crypto.randomUUID();
    const randomName = `${uuid}.${fileExtension}`;
    const filePath = `${CONFIG.dir}/${randomName}`;
    if (!file.content) {
      console.log(`File ${fileName} is empty`)
      return;
    }
    await Deno.writeFile(filePath, file.content);
    const assetUrl = new URL(`/asset/${randomName}`, selfUrl);
    console.log(`File ${fileName} uploaded successfully, saved at ${assetUrl.toString()}`)
    return {
      randomName: randomName,
      originalName: file.originalName,
      path: assetUrl.toString(),
    }
  }))

  console.log(`File uploaded successfully`)
  context.response.body = {
    message: "Asset uploaded successfully",
    uploadedFiles: uploadedFiles.map((file: any) => file.value).filter(Boolean),
  }
});
router.get("/asset/:name", async (context) => {
  const name = context.params.name;
  const filePath = `${CONFIG.dir}/${name}`;
  if (!await Deno.stat(filePath)) {
    return context.response.body = {
      message: "File not found",
    }
  }
  context.response.body = await Deno.readFile(filePath);
})


const app = new Application();
app.use(router.allowedMethods());
app.use(oakCors({
  origin: /^.+localhost:(3000|8080)$/,
  credentials: true,
  allowedHeaders: ["Authorization", "Content-Type"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  optionsSuccessStatus: 200,
  preflightContinue: true,
}));
app.use(router.routes());


const port: number = parseInt(Deno.env.get('PORT') ?? '') || 6767;

console.log(`Listening on port ${port}`);
console.log(`POST /asset to upload the file`)

await app.listen({ port: port });