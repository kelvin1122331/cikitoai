import { usePageMeta } from '../lib/router'
import { Distribusi } from '../components/Distribusi'
import { CtaBanner, PageHero, Pager } from '../site/parts'
import { ROUTE_MAP } from '../site/routes'

interface Props {
  onLaunch: () => void
  active: boolean
}

export function BawaKeMana({ onLaunch, active }: Props) {
  const route = ROUTE_MAP['/bawa-ke-mana-saja']
  usePageMeta(route.title, route.description)

  return (
    <>
      <PageHero
        route={route}
        title="Satu bubble, di website mana pun"
        subtitle="Widget yang sama bisa keluar dari situs ini: tempel di website lain, panggil lewat bookmarklet, lepas jadi jendela mengambang di atas aplikasi lain, pasang sebagai ekstensi peramban, atau pasang sebagai aplikasi."
      />

      <Distribusi />

      <CtaBanner
        onLaunch={onLaunch}
        active={active}
        title="Coba dulu di sini"
        desc="Sebelum menempelkannya ke tempat lain, jalankan widgetnya di halaman ini dan rasakan geser, ubah ukuran, dan buka–tutupnya."
      />
      <Pager path={route.path} />
    </>
  )
}
