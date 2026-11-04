# Перерисовать картинку-превью (assets/og.png): python3 tools/make_og.py static/assets
# Нужен Pillow: pip install pillow
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import sys
out = sys.argv[1]
W,H=1200,630
img=Image.new("RGB",(W,H),"#23352b")
glow=Image.new("RGB",(W,H),"#23352b"); g=ImageDraw.Draw(glow)
g.ellipse((700,-200,1400,450),fill="#b88a5a"); g.ellipse((-200,350,500,900),fill="#3b5244")
glow=glow.filter(ImageFilter.GaussianBlur(120)); img=Image.blend(img,glow,.7)
d=ImageDraw.Draw(img)
serif="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"; sans="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
f1=ImageFont.truetype(serif,104); f2=ImageFont.truetype(sans,30); f3=ImageFont.truetype(sans,22)
# lotus
def lotus(d,cx,cy,s,col,w):
    d.arc((cx-s*.5,cy-s*1.05,cx+s*.5,cy+s*.35),200,340,fill=col,width=w)
d.text((90,110),"SPA & WELLNESS",font=f3,fill="#d9b48a")
d.line((90,150,150,150),fill="#d9b48a",width=2)
d.text((86,190),"Black Horse SPA",font=f1,fill="#f6f1ea")
d.text((90,340),"Массаж · SPA-ритуалы · Хаммам",font=f2,fill="#e8dccb")
d.text((90,388),"Massage · Spa rituals · Hammam",font=f2,fill="#cfc3b2")
d.rounded_rectangle((90,470,470,530),radius=30,fill="#f6f1ea")
d.text((122,484),"Запись в WhatsApp →",font=f2,fill="#23352b")
# stones
for (w,h,y) in [(110,40,420),(170,56,452),(240,72,494)]:
    cx=950; d.ellipse((cx-w/2,y,cx+w/2,y+h),fill="#2c2e2a",outline="#4a4a44",width=2)
img.save(out+"/og.png",optimize=True)
