const Article = require('../articles/article.model')
const Vote = require('../votes/vote.model')

const { extractText } = require('../../utils/html-sanitizer')

/**
 * Search the articles
 *
 * @param {object} req - request
 * @param {object} h - response
 * @payload {String} req.payload.search - string to search
 *
 * @returns Articles array matching the search
  @author Grégory LATINIER
 */
const searchArticles = async (req, h) => {
  const { categories, tags, languages, project, title, sortBy, limit, skip } = req.payload
  const optionalConditions = {}
  if (categories && categories.length > 0) {
    optionalConditions.category = { '$in': categories }
  }

  if (tags && tags.length > 0) {
    optionalConditions.tags = { '$in': tags }
  }

  if (languages && languages.length > 0) {
    optionalConditions.lang = { '$in': languages }
  }

  if (project && project.length > 0) {
    optionalConditions.project = project
  }

  const articles = await Article.find({
    title: { '$regex': title, '$options': 'i' },
    ...optionalConditions })
    .sort(sortBy)
    .limit(limit)
    .skip(skip)
    .populate('author', 'username avatarUrl')
    .select('author body createdAt slug tags title upVotes')
    .lean()

  const user = req.auth.credentials && req.auth.credentials.uid
  let votes
  if (user) {
    const ids = articles.map((a) => a._id)
    votes = await Vote.find({
      objRef: 'articles',
      objId: { $in: ids },
      user
    })
  }

  articles.forEach((article) => {
    article.body = extractText(article.body).substr(0, 250)
    if (votes) {
      const vote = votes.find((v) => v.objId.toString() === article._id.toString())
      article.userVote = vote && vote.dir
    }
  })
  return h.response(articles)
}

module.exports = {
  searchArticles
}
