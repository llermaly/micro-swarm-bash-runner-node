# micro-swarm-bash-runner-node

## Do not use this, is just a proof of concept.

you need to add the parameters on `/code/params` for this to work


### Install stuff

```
npm install

```


### Run for development

```
npm run serve
```

This allows the code to be restarted on change (is using nodemon).



### Deploy 


```
npm run build
```

This will generate the `/build` directory, thats the production code.


### Test production

```
npm run production
```

This will run the code of the `/build` folder (thats the code generated after traspiling).



The es6 code should be placed on the `code` folder!