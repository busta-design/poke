# NEXT NOTES

## Estructura

Todo se desarrolla en `_app.js` donde recibe componentes y props, para lo demas podemos usar dentro de pages tanto para front junto a **index.js** o back dentro del folder **api** donde pondremos una sintaxis parecida a node.

Tenemos un archivo llamado **./styles/globals.css** donde colocamos nuestros estilos globales.

Dentro de public ponemos los archivos con los que serviremos a los usuarios.

## Paginas, Link y Code Spliting

Se indexa el contenido html que usamos. Para navegar entre paginas usamos un componente nativo de next llamado:

```js
    import Link from 'next/link'
    <Link href="/">inicio</Link>
```

Ahora vemos que navegando hacia la otra pagina next nos devuelve codigo javascript. Ademas que solo nos devulve el codigo que se pidio, y no asi la aplicacion entera como react. Esto hace que la carga de los archivos sea de acuerdo a lo que se necesite y que la primera carga sea muy rapida. Esto el **CODE SPLITiNG**.

## Rutas Dinamicas

Para crear una ruta dinamica lo que debemos hacer es crear una carpeta que es como una ruta siguiente y luego entre corchetes crear una archivo js:

```js
[id].js
```

Con esto nosotros podemos capturar la *key* que nos llega por el path: **/chanchitos/esteeselid**

para poder captura esto en nuestro archivo debemos usar un hook de next:

```js
import {useRouter} from 'next/router'

const router = useRouter()
const {id} = router.query
console.log(id)
```

**OJO**: algo observable es que la primera vez que corre esto sale un *undefined* en nuestra variable, luego ya sale el valor verdadero. Esto es debido a la OPTIMIZACION AUTOMATICA DE PAGINAS ESTATICAS y es para que las paginas funcionen mas rapida. Despues de hidratarse el componente llega con su valor.

A lado de **query** tenemos la propiedad **isReady**, pero **OJO** que no debemos usar esta propiedad para renderizado condicional (dicho por los creadores). Lo que debemos hacer es ayudarnos del **useEffect** y **useState** usando los *loaders* y sembrando la logica de retorno y dependencia por sobre *router.isReady*:

```js
const ChanchitoDinamico = () => {
    const [loaded, setLoaded] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if(router.isReady) {
            setLoaded(true)
        }
    }, [router.isReady])

    if(!loaded) return null

    console.log({router}, router.query.id)

    return (
        <div>
            <p>Chanchito dinamico</p>
        </div>
)
}
```

El problema de esto es el codigo repetitivo que se tiene para la logica de renderizado, pero eso lo solucionaremos en la siguiente parte.

## useIsMounted

Aqui vamos a crear un custom hook para automatizar la parte del loader.

```js
const useIsMounted = () => {
    const [loaded, setLoaded] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if(router.isReady) {
            setLoaded(true)
        }
    }, [router.isReady])

    return loaded

}
```

Esta logica permite reutilizarlo en otros lados y tambien ocultar codigo.

La aplicacion en nuestro componente luce como:

```js
const isMounted = useIsMounted()
const router = useRouter()

if(!isMounted) return null
```
## Rutas dinamicas anidadas

Para crear rutas del tipo: `/pockemons/{id}/descripcion` debemos poner de la misma forma en los folders con ese nombre: `page/pokemons/[id]/descripcion.js`.

Aqui agarras de la misma manera para las **query** justamente con esta misma palabra las palabras se iran acumulando.

En caso de tu querer puedes poner un `index.js` dentro del folder **[id]**. Esto provocaria que solo se necesite todo sin la palabra descipcion. **OJO** con los index que tienden a ser super importantes: `pages/pokemones/[id]/index.js`

## Componente Image

Este componente es importante usarlo porque tiene funcionlidad: optimizar imagenes antes de entregar al usuario, tambien decide de acuerdo a la resolucion del dispositivo.

Usamos el componente:

```js
import Image from 'next/image'
<Image src='/image.png' width={400} height={400} />
```

O tambien de esta forma:

```js
import Image from 'next/image'
import Coffe from '../public/image.png'
<Image src={Coffe} width={400} height={400} />
```

Debemos poner si o si el *width* y *height*.

## Generando contenido estatico - getStaticProps

El renderizado estatico es decirle a next que toda pagina que tenga cierta funcion la renderice y sirva a los usuarios antes de todo, asi todas las paginas tienen un *html* generado rapido.

Entonces creamos la funcion `getStaticProps()` y dentro podemos hacer diferentes acciones donde debemos retornar si o si un objeto que tenga un *key* llamada **props** la cual es un array que puede tener otros props para el componente, debemos recibirlo desde el componente de la misma manera que solemos recibir los props:

```js
export default function Home({pokemones}) {
  console.log(pokemones)
  return (
    <p>Pokemones</p>
  )
}

export const getStaticProps = async () => {
  const response = await fetch('https://pokeapi.co/api/v2/ability/?limit=20&offset=20')
  const data = await response.json()

  return {
    props: {pokemones: data.results}
  }
}
```

Si hacemos el `npm run build` podemos observar que saca la informacion de la api. 

Next con esta funcion hace que saque antes de crear el archivo html.

Algo que tambien podemos ver que esta usando es **SSG: Static Site Generation**, next esta tomando este archivo de JS y lo esta convirtiendo a html con la informacion que previamente obtuvimos.

## Nueva ruta dinamica

Juntamos los datos para tener rutas dinamicas: */pokemones/:id* y esto lo hacemos usando el **id** que nos llega de la misma api.

```js
const Pokemon = ({pokemon}) => {
  const id = pokemon.url.split('/').filter(x => x).pop()
  return (
    <li><Link href={`/pokemones/${id}`}>{pokemon.name}</Link></li>
  )
}
```

## Agregando SSR a una pagina

**OJO**: Que en cuando usamos **getStaticProps** o **getServerSideProps** los console log no aparecen en el forntend porque todo eso se ejecuta en su **backend**. Lo podemos ver en la consola.

En este caso que necesitamos sacar los datos de la api lo podemos llemar desde antes con una funcion llamada **getServerSideProps** que recibe un `({params})` (*params* hace referencia al argumento que nos llega por el path).

Esto de params es porque le llegan `(props)`. Este es un objeto que tiene muchos valores, entre ellas **params** y **query**. La diferencia entre estas es que params son los que vienen despues del slash `/` y las query los que vienen despues del `?`.

```js
// http://localhost:3000/pokemones/21?esta=ko
{
  query: { esta: 'ko', id: '21' },
  params: { id: '21' },
}
```

Tambien podemos observar que hay un **res** y **req** en nuestro objeto.

Podmeos observar que cuando nosotros reiniciamos la pagina tarda un poco mas y es por esta funcion, hace que retorne el html, pero si nosotros navegamos directamente por la interfaz vemos que lo hace rapido, esto es porque en este ultimo retorna un JS.

> Lo que quiero decir es que si tarda en la carga una primera vez, pero mientras no reinicies la app esos datos estaran guardados y seran devueltos como JS, como en react, y sera super rapido esta vez.

## Componente pokemon e imagenes fuera del dominio

Desestructuramos los datos y vemos que al poner el URL de la imagen del pokemon nos bota un error, este error es directamente de next que no nos permite utilizar otras imagenes de terceros fuera de nuestra aplicacion, asi que debemos configurar esto.

Esto lo agregamos como ruta a la que hacer llamados. Debemos ir al archivo `next.config.js` de nuestro globlal, y agregar dentro del module exports:

```js
images: {
  domains: ['raw.githubusercontent.com'],
},
```

**No olvidar reiniciar el servidor**.

## Como usar styled-components con NextJS

A primeras tendremos problemas con **Styled-components**. El erro es que va a renderizar clases en el backend pero no en el forntend.

Para poder usarlo debemos instalar **Styled-components** y **babel plugin**:

```bash
npm i -S styled-components
npm i -D babel-plugin-styled-components
```

Ahora creamos un archivo llamado `.babelrc` y debemos poner:

```json
{
  "presets": ["next/babel"],
  "plugins": ["styled-components"]
}
```

Ademas dentro de **pages** creamos un archibo llamado `_document.js` y dentro escribimos:

```js
import Document from 'next/document'
import {ServerStyleSheet} from 'styled-components'

export default class MyDocument extends Document {
  static async getInitialStyleProps(ctx) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () => 
        originalRenderPage({
          enhanceApp: App => props => 
            sheet.collectStyles(<App {...props}/>)
        })
      const initialProps = await Document.getInitialProps(ctx)

      return {
        ...initialProps,
        style: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        )
      }
    } finally {
      sheet.seal()
    }
  }
}

```

Toda esta configuracion podemos obtenerla yendo a:

- styled components`
- entras y buscas Server Side Rendering
- Buscas para la parte de Next y entras a su Github
- Buscas el archivo dentro de **pages** llamado **_document.js**.
- Copias y pegas todo en tu archivo.

## Paginas estaticas dinamicas

Si nosotros queremos generar mas de una ruta estatica (o sea las dinamicas), usamos `getStaticProps` en lugar de `getServerSideProps`.

Ahora observamos que cuando quisimos hacer los mismo pero con el **getStaticProps** no funciono. En la misma solucion nos muestra que debemos usar `getStaticPaths` para informar cuales tendremos.

El codigo quedaria algo asi:

```js
export const getStaticPaths = async () => {
  const paths = [
    {params: {id: '1'}},
    {params: {id: '2'}}
  ]

  return {
    paths,
    fallback: false
  }
}
```

donde podemos ver los **paths** habilitados (1 y 2). Solo podemos observar los html de las rutas que pusimos a mano, los demas no son renderizados.

Para solucionar esto es tan simple como cambiar el fallback **fallback: true**. Lo que hace next es renderizar esta pagina de manera *lazy*, pero en eso tarda en ejecutarse el getStaticProps, asi que enviara un data vacio. Para hacer la logica de renderizado nos ayudamos de `router`.

```js
const router = useRouter()
if (router.isFallback) return <p>Cargando...</p>
```

Entonces la primera peticion tarda, pero las siguientes seran veloces porque ya solo te devolvera el JS.

Otra alternativa es que podemos usar como valor en el **fallback: 'blocking'**, esto hara que no necesitemos la logica de renderizado porque simplemente se encarga de una vez terminado el renderizado pasarnoslo el html completo.

> Algo curioso en este ultimo es que el **fallback: true**, funciona como este 'blocking'. no aparece el error ni el cargado.

Segun lo que dice es decision nuestra como queremos devolverle al usuario el contenido: Con *Cargando* y sin *Cargando*.

## Creando un repositorio en Github

Lo subimos al repositorio.
Para esto primero vamos a Github y hacemos lo siguiente:

- Vamos a *settings*.
- Ponemos en *Developer Settings*.
- Ahora *Personal Access Tokens*.
- Luego creamos un nuevo Access Token.
- Podemos poner en *note* le nombre de nuestra compu.
- *No Expiration*.
- Seleccionar todas las casillas dentro de *repo*.
- OK

Copiamos el *access token* generado y nos vamos a crear un repositorio comun y corriente.
> Debemos tener presionado el `HTTPS` al momento de clonar, ya que el *access token* que generamos solo servira en este.

Hacemos el proceso para subir desde nuestro repositorio y hay una parte que nos pide *browser device* o *token*. Nosotros ponemos e token que copiamos y recien nos dejara subir el proyecto.

> El token desaparece una vez salgas de la pagina, procura crearlo cuando todo este listo.

## Despliegue en Vercel

Buscamos *vercel.com*. Nos registramos y damos siguientes.
> En el curso vemos que al hacer un building hay un error causado por el *.eslint*, la forma de solucionarlo es borrando este archivo o agregando la excepcion para el *.babelrc*.

Para actualizar simplemente tienes que hacer un push al proycto, este hara un build solo.
