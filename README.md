# Development

Install dependecnies

```
npm install
```

Rebuild Elecron
```
./node_modules/.bin/electron-rebuild -p -t "dev,prod,optional"
```

Start Project
```
npm start
```

## Linux (Considerations)

Sharp can cause problems on v0.24
You may need to use 0.23.4 and change package.json accordingly.


asset-manifest.json
```
[
  {
    id: '1234325', // the asset directory name
    name:     '',   // rename of file
    original: '',   // original name of file
    verions: [
      '1234124', // version named as epoch
    ]
  }
]
```
