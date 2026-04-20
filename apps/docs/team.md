---
layout: page
---
<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.gravatar.com/avatar/45771b7793feb7b6a95418eeef3748a1',
    name: 'YoungMayor',
    title: 'Founder & Lead Developer',
    org: 'MayR Labs',
    orgLink: 'https://mayrlabs.com',
    links: [
      { icon: 'github', link: 'https://github.com/YoungMayor' },
      { icon: 'awwwards', link: 'https://aghogho.mayrlabs.com' }
    ],
    sponsor: 'https://github.com/sponsors/YoungMayor'
  },
]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      Our Team
    </template>
    <template #lead>
      The core team and contributors shaping the future of backend simulation.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members />
</VPTeamPage>
