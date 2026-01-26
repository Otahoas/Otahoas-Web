const redirects = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header',
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  const kokouksetRedirect = {
    source: '/kokoukset',
    destination: 'https://drive.google.com/drive/folders/14QoR-2SS9qWVidh4lDUunij3rfrFz87P?usp=sharing',
    permanent: false,
  }

  const redirects = [internetExplorerRedirect, kokouksetRedirect]

  return redirects
}

export default redirects
