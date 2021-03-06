<script>
import { mapGetters } from 'vuex'
import Comments from 'src/components/tools/comments'
import SocialShare from 'src/components/tools/social-share'
import Vote from 'src/components/tools/vote'
import { TextUtilsMixin } from 'src/mixins/text-utils'
import ActivityTab from './components/activity-tab'

export default {
  name: 'page-bounties-view',
  mixins: [TextUtilsMixin],
  components: {
    Comments,
    SocialShare,
    Vote,
    ActivityTab
  },
  preFetch ({ store, currentRoute, redirect }) {
    return store.dispatch('bounties/fetchBounty', {
      author: currentRoute.params.author,
      slug: currentRoute.params.slug
    }).then(data => {
      if (!data) {
        redirect(`/${currentRoute.params.locale}/not-found`)
      }
    })
  },
  meta () {
    return {
      title: this.bounty.title,
      meta: {
        description: { name: 'description', content: this.htmlToTextTruncate(this.bounty.body, 240) },
        // Twitter Card data
        twitterTitle: { name: 'twitter:title', content: this.bounty.title },
        twitterDescription: { name: 'twitter:description', content: this.htmlToTextTruncate(this.bounty.body, 200) },
        twitterCreator: { name: 'twitter:creator', content: `@${this.bounty.author.username}` },
        twitterImageSrc: { name: 'twitter:image', content: this.extractFirstImage(this.bounty.body) },
        // Facebook Open Graph data
        ogTitle: { property: 'og:title', content: this.bounty.title },
        ogImage: { property: 'og:image', content: this.extractFirstImage(this.bounty.body) },
        ogDescription: { property: 'og:description', content: this.htmlToTextTruncate(this.bounty.body, 200) },
        articlePublishedTime: { name: 'article:published_time', content: this.bounty.createdAt },
        articleModifiedTime: { name: 'article:modified_time', content: this.bounty.updatedAt },
        articleTag: { name: 'article:tag', content: this.bounty.skills.join(' ') }
      }
    }
  },
  computed: {
    ...mapGetters('auth', ['user']),
    ...mapGetters('bounties', ['bounty']),
    hasEditRights () {
      return this.user && this.bounty.author._id === this.user.uid
    }
  }
}
</script>

<template lang="pug">
.bounty-view
  .row.gutter-md.bounty-header
    .col-md-9.flex.justify-between.items-center
      router-link.author-info.flex.items-center(:to="`/${$route.params.locale}/@${bounty.author.username}`")
        img(:src="bounty.author.avatarUrl")
        div
          .author.flex
            strong {{bounty.author.username}}
            .reputation {{bounty.author.reputation.toFixed(0)}}
          .job {{bounty.author.job}}

  .row.gutter-md.bounty-content
    .col-md-9
      q-card
        q-card-title
          router-link.project.flex.items-center(v-if="bounty.project", :to="`/${$route.params.locale}/projects/${bounty.project.slug}`")
            img(:src="bounty.project.avatarUrl")
            strong {{ bounty.project.name }}
          .actions(slot="right")
            social-share(:title="bounty.title", :description="bounty.body")
            q-btn.edit-bounty(v-if="hasEditRights", color="primary", icon="mdi-pencil", flat, :to="`/${$route.params.locale}/bounties/${$route.params.author}/${$route.params.slug}/edit`")
        q-card-main
          .title {{bounty.title}}
          .date {{$d(bounty.createdAt, 'long')}}
          .post-view(v-html="bounty.body")
        q-card-actions.flex.justify-between.items-center
          ul.bounty-skills
            li(v-for="skill in bounty.skills")
              | {{ skill }}
      .bounty-footer.flex.justify-between.items-center
        vote(
          obj="bounties"
          :id="bounty._id"
          :initialVoteCount="bounty.upVotes"
          :initialUserVote="bounty.userVote"
        )
  q-tabs.q-mt-md(color="white", text-color="black", underline-color="primary")
    q-tab(
      default
      slot="title"
      name="discussion"
      :label="$t('bounties.view.tabs.discussion')"
    )
    q-tab(
      slot="title"
      name="proposals"
      :label="$t('bounties.view.tabs.proposals')"
    )
    q-tab(
      slot="title"
      name="activity"
      :label="$t('bounties.view.tabs.activity')"
    )
    q-tab-pane(name="discussion")
      comments(obj="bounty", :id="bounty._id")
    activity-tab(:activity="bounty.activity")
</template>

<style lang="stylus">
  @import "~variables"
  .bounty-view
    .bounty-header
      margin-bottom 20px
      font-size 15px
      .author-info
        text-decoration none
        img
          width 55px
          height 55px
          border-radius 50%
          margin-right 10px
        .author
          font-weight 600
          color $grey-10
          .reputation
            color #fff
            background $primary
            padding 3px 5px
            border-radius 3px
            font-size 12px
            margin-left 10px
        .job
          color $grey-6
    .bounty-content
      .q-card
        background #fff
        padding 0 10px
      .project
        font-weight 600
        font-size 15px
        color $grey-10
        text-decoration none
        img
          height 35px
          width 35px
          border-radius 3px
          margin-right 10px
      .actions
        .q-btn
          padding 4px 8px
      .title
        font-size 32px
        font-weight bold
        color $grey-10
      .date
        font-size 15px
        color $grey-6
        padding 10px 0
      .q-card-actions
        border-top 1px solid $grey-4
      ul.bounty-skills
        padding 0
        list-style none
        font-weight 600
        font-size 14px
        li
          display inline-block
          border 1px solid $grey-4
          border-radius 3px
          padding 5px
          &:not(:last-child)
            margin-right 8px
    .bounty-footer
      margin-top 20px
      .views
        color $grey-8
        font-size 15px
        strong, i
          margin-right 5px
</style>
