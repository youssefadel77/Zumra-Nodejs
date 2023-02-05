const _ = require('lodash');
const utils = require('../../../../common/utils');
const { pageSize, maxPageSize } = require('../../../../config').common;

module.exports = (ctx) => {
  let page;
  let limit;
  const { query } = ctx.request;
  const parsedQuery = {
    page: 0,
    limit: pageSize,
    fields: {},
    sort: {},
    populate: []
  };

  Object.entries(query).forEach(([key, value]) => {
    switch (key) {
      case 'page':
        page = utils.parseInt(value);
        page = page >= 0 ? page : 0;
        parsedQuery.page = page;
        break;
      case 'limit':
        limit = utils.parseInt(value);
        limit = limit >= maxPageSize ? maxPageSize : limit;
        parsedQuery.limit = limit;
        break;
      case 'fields':
        value.split(',').forEach((entry) => {
          const op = entry.startsWith('-') ? 0 : 1;
          const field = op === 1 ? entry : entry.substr(1);
          parsedQuery.fields[field] = op;
        });
        break;
      case 'populate':
        parsedQuery.populate = value.split(',');
        break;
      case 'roles':
        parsedQuery.roles = value.split(',');
        break;
      case 'sort':
        value.split(',').forEach((entry) => {
          let field = entry.trim();
          const op = field.startsWith('-') ? -1 : 1;

          if (!field || field.length === 0) {
            return;
          }

          if (op < 0) {
            field = field.substr(1);
          }

          parsedQuery.sort[field] = op;
        });
        break;
      default:
        parsedQuery[key] = value;
    }
  });

  _.merge(ctx.request.query, parsedQuery);
};
