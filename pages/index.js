import Link from "next/link"

const Pokemon = ({pokemon}) => {
  const id = pokemon.url.split('/').filter(x => x).pop()
  return (
    <li><Link href={`/pokemones/${id}`}>{pokemon.name}</Link></li>
  )
}

export default function Home({pokemones}) {
  return (
    <div>
      <p>Mis Pokemones Amigos</p>
      <ul>
        {pokemones.map(pokemon => <Pokemon pokemon={pokemon} key={pokemon.name} />)}
      </ul>
    </div>
  )
}

export const getStaticProps = async () => {
  const response = await fetch('https://pokeapi.co/api/v2/ability/?limit=20&offset=20')
  const data = await response.json()

  return {
    props: {pokemones: data.results}
  }
}
