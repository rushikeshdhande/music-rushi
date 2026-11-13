gci -r -include *.jsx,*.css | % { "==== $($_.Name) ===="; gc $_ } > ..\AllFiles.txt



 git add .                                                
>> git commit -m "Initial web music player with share URLs"

git push -u origin main


cd "E:\Music Player\Web\music"
npm run build
npx vercel --prod