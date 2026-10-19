// Field definitions for each editable collection. The admin forms and lists are generated from these.
// kinds: text, textarea, select, number, date, checkbox, image, images, tags, url
export const COLLECTIONS = {
  thrusts: {
    label: 'Research thrusts', singular: 'research thrust', endpoint: '/thrusts', orderable: true,
    titleField: 'title', subtitle: (d) => d.tag,
    fields: [
      { name: 'title', label: 'Title', kind: 'text', required: true },
      { name: 'tag', label: 'Lead discipline', kind: 'select', options: ['AI/ML', 'Chemistry', 'Biology'] },
      { name: 'summary', label: 'Summary (one or two sentences, shown on the home page)', kind: 'textarea', rows: 3 },
      { name: 'details', label: 'Details (shown on the Research page; leave a blank line between paragraphs)', kind: 'textarea', rows: 8 },
      { name: 'keywords', label: 'Keywords', kind: 'tags', help: 'Separate with commas' },
      { name: 'image', label: 'Image (shown on the card and the programme page)', kind: 'image' },
      { name: 'paperDois', label: 'Representative paper DOIs', kind: 'tags', help: 'Separate with commas. Papers must already be added under Publications. Leave empty to match papers by keyword.' },
    ],
  },
  platforms: {
    label: 'Platforms', singular: 'platform', endpoint: '/platforms', orderable: true,
    titleField: 'name', subtitle: (d) => `${d.kind}, ${d.status}`,
    fields: [
      { name: 'name', label: 'Name', kind: 'text', required: true },
      { name: 'kind', label: 'Type', kind: 'select', options: ['Database', 'Model', 'Tool', 'Dataset'] },
      { name: 'status', label: 'Status', kind: 'select', options: ['Planned', 'Beta', 'Live'] },
      { name: 'text', label: 'What it does', kind: 'textarea', rows: 3 },
      { name: 'link', label: 'Link', kind: 'url' },
    ],
  },
  people: {
    label: 'People', singular: 'person', endpoint: '/people', orderable: true,
    titleField: 'name', subtitle: (d) => [d.role, d.group].filter(Boolean).join(', '), thumb: 'photo',
    fields: [
      { name: 'name', label: 'Full name', kind: 'text', required: true },
      { name: 'role', label: 'Role or designation', kind: 'text' },
      { name: 'group', label: 'Group', kind: 'select', options: ['Faculty', 'Scientists & postdocs', 'PhD students', 'MTech & MSc students', 'Undergraduate researchers', 'Project staff', 'Alumni'] },
      { name: 'photo', label: 'Photo', kind: 'image' },
      { name: 'bio', label: 'Bio (shown in the "View bio" pop-up; leave a blank line between paragraphs)', kind: 'textarea', rows: 6 },
      { name: 'currentPosition', label: 'Current position (alumni only), e.g. Postdoc, EPFL', kind: 'text' },
      { name: 'interests', label: 'Research interests', kind: 'tags', help: 'Separate with commas' },
      { name: 'email', label: 'Email', kind: 'text' },
      { name: 'profileLink', label: 'Profile or homepage link', kind: 'url' },
      { name: 'scholarLink', label: 'Google Scholar link', kind: 'url' },
    ],
  },
  publications: {
    label: 'Publications', singular: 'publication', endpoint: '/publications', doiImport: true,
    titleField: 'title', subtitle: (d) => [d.year, d.venue].filter(Boolean).join(', '),
    fields: [
      { name: 'title', label: 'Title', kind: 'textarea', rows: 2, required: true },
      { name: 'authors', label: 'Authors', kind: 'textarea', rows: 2 },
      { name: 'venue', label: 'Journal, conference or preprint server', kind: 'text' },
      { name: 'year', label: 'Year', kind: 'number' },
      { name: 'doi', label: 'DOI', kind: 'text', help: 'For example 10.1021/acscatal.0c04525' },
      { name: 'link', label: 'Link (if different from the DOI page)', kind: 'url' },
      { name: 'image', label: 'Graphical abstract (TOC image)', kind: 'image' },
      { name: 'featured', label: 'Highlight this paper', kind: 'checkbox' },
    ],
  },
  news: {
    label: 'News & events', singular: 'news item', endpoint: '/news',
    titleField: 'title', subtitle: (d) => [d.kind, d.date && new Date(d.date).toLocaleDateString('en-IN')].filter(Boolean).join(', '), thumb: 'image',
    fields: [
      { name: 'title', label: 'Title', kind: 'text', required: true },
      { name: 'kind', label: 'Type', kind: 'select', options: ['News', 'Event', 'Seminar', 'Award'] },
      { name: 'date', label: 'Date (event date for events)', kind: 'date' },
      { name: 'venue', label: 'Venue (for events)', kind: 'text' },
      { name: 'text', label: 'Text (leave a blank line between paragraphs)', kind: 'textarea', rows: 8 },
      { name: 'image', label: 'Image', kind: 'image' },
      { name: 'link', label: 'Registration or more-info link', kind: 'url' },
    ],
  },
  albums: {
    label: 'Gallery', singular: 'album', endpoint: '/albums', orderable: true,
    titleField: 'title', subtitle: (d) => [d.images?.length ? `${d.images.length} photos` : 'No photos yet', d.date && new Date(d.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })].filter(Boolean).join(', '),
    thumb: (d) => d.images?.[0],
    fields: [
      { name: 'title', label: 'Album title', kind: 'text', required: true },
      { name: 'date', label: 'Date', kind: 'date' },
      { name: 'description', label: 'Description', kind: 'textarea', rows: 3 },
      { name: 'images', label: 'Photos (the first one is the album cover)', kind: 'images' },
    ],
  },
  openings: {
    label: 'Openings', singular: 'opening', endpoint: '/openings', listQuery: '?all=true',
    titleField: 'title', subtitle: (d) => `${d.type}${d.isOpen ? '' : ', closed'}${d.deadline ? `, apply by ${new Date(d.deadline).toLocaleDateString('en-IN')}` : ''}`,
    fields: [
      { name: 'title', label: 'Position title', kind: 'text', required: true },
      { name: 'type', label: 'Type', kind: 'select', options: ['PhD', 'JRF / SRF', 'Postdoc', 'Project staff', 'Internship'] },
      { name: 'isOpen', label: 'Show on the website (untick to close the position)', kind: 'checkbox', default: true },
      { name: 'deadline', label: 'Application deadline', kind: 'date' },
      { name: 'description', label: 'Description', kind: 'textarea', rows: 8 },
      { name: 'eligibility', label: 'Who can apply', kind: 'textarea', rows: 5 },
      { name: 'applyLink', label: 'Application form link', kind: 'url' },
      { name: 'contactEmail', label: 'Contact email for questions', kind: 'text' },
    ],
  },
};

export function blankFor(schema) {
  const doc = {};
  for (const f of schema.fields) {
    if (f.default !== undefined) doc[f.name] = f.default;
    else if (f.kind === 'select') doc[f.name] = f.options[0];
    else if (f.kind === 'checkbox') doc[f.name] = false;
    else if (f.kind === 'tags' || f.kind === 'images') doc[f.name] = [];
    else if (f.kind === 'number') doc[f.name] = f.name === 'year' ? new Date().getFullYear() : '';
    else if (f.kind === 'date') doc[f.name] = f.name === 'date' ? new Date().toISOString().slice(0, 10) : '';
    else doc[f.name] = '';
  }
  return doc;
}
