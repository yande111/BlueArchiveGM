from PIL import Image
import os

def convert_to_rgba(png_path):
    with Image.open(png_path) as im:
        # 转成RGBA格式
        if im.mode != "RGBA":
            im = im.convert("RGBA")
            im.save(png_path)
            print(f"[转换成功] {png_path}")
        else:
            print(f"[已是RGBA] {png_path}")

def batch_convert_rgba(folder):
    for root, _, files in os.walk(folder):
        for file in files:
            if file.lower().endswith(".png"):
                full_path = os.path.join(root, file)
                try:
                    convert_to_rgba(full_path)
                except Exception as e:
                    print(f"[错误] 处理 {full_path} 失败: {e}")

if __name__ == "__main__":
    icons_folder = "./"
    batch_convert_rgba(icons_folder)
