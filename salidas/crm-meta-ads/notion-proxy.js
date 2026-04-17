const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('Error: .env file not found.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8').trim().split(/\r?\n/);
const tokenLine = envContent.find(line => line.startsWith('NOTION_TOKEN='));
const token = tokenLine ? tokenLine.split('=', 2)[1] : null;
if (!token) {
  console.error('Error: NOTION_TOKEN not found in .env');
  process.exit(1);
}

const dbId = '34539896-8d66-81c9-9e55-e0ffd5f7012d';
const notionHost = 'api.notion.com';
const notionVersion = '2022-06-28';
const port = 3000;

function notionRequest(path, method, body) {
  const options = {
    hostname: notionHost,
    port: 443,
    path,
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': notionVersion,
      'Content-Type': 'application/json',
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const parsed = data ? JSON.parse(data) : null;
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(parsed);
        } else {
          reject({ status: res.statusCode, body: parsed });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
  });
}

function notionRichText(text) {
  return [{ type: 'text', text: { content: text || '' } }];
}

function notionPropertyValue(value, type) {
  if (type === 'rich_text') return { rich_text: notionRichText(value) };
  if (type === 'title') return { title: notionRichText(value) };
  if (type === 'phone_number') return { phone_number: value || '' };
  if (type === 'email') return { email: value || '' };
  if (type === 'date') return { date: { start: value || new Date().toISOString().split('T')[0] } };
  if (type === 'number') return { number: value === undefined || value === null ? null : Number(value) };
  if (type === 'select') return { select: { name: value || 'Otro' } };
  return {};
}

function notionPropertiesFromLead(lead) {
  return {
    Nombre: notionPropertyValue(lead.name, 'title'),
    Marca: notionPropertyValue(lead.brand, 'select'),
    Campaña: notionPropertyValue(lead.campaign, 'rich_text'),
    Excursión: notionPropertyValue(lead.product, 'rich_text'),
    Canal: notionPropertyValue(lead.channel, 'select'),
    Teléfono: notionPropertyValue(lead.phone, 'phone_number'),
    Email: notionPropertyValue(lead.email, 'email'),
    'Fecha de ingreso': notionPropertyValue(lead.date, 'date'),
    Estado: notionPropertyValue(lead.stage, 'select'),
    Responsable: notionPropertyValue(lead.owner, 'rich_text'),
    Venta: notionPropertyValue(lead.sale, 'select'),
    'Monto estimado': notionPropertyValue(lead.amount, 'number'),
    Notas: notionPropertyValue(lead.notes, 'rich_text'),
  };
}

function mapNotionPage(page) {
  const props = page.properties || {};
  const getTitle = p => Array.isArray(p?.title) ? p.title.map(item => item.plain_text).join('') : '';
  const getText = p => Array.isArray(p?.rich_text) ? p.rich_text.map(item => item.plain_text).join('') : '';
  const getSelect = p => p?.select?.name || '';
  const getDate = p => p?.date?.start || '';

  return {
    notionPageId: page.id,
    notionUrl: page.url,
    name: getTitle(props.Nombre),
    brand: getSelect(props.Marca),
    campaign: getText(props.Campaña),
    product: getText(props['Excursión']),
    channel: getSelect(props.Canal),
    phone: props['Teléfono']?.phone_number || '',
    email: props.Email?.email || '',
    date: getDate(props['Fecha de ingreso']),
    stage: getSelect(props.Estado),
    owner: getText(props.Responsable),
    sale: getSelect(props.Venta),
    amount: props['Monto estimado']?.number || null,
    notes: getText(props.Notas),
    createdAt: page.created_time,
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  try {
    if (req.method === 'GET' && url.pathname === '/notion/leads') {
      const limit = Number(url.searchParams.get('limit') || 50);
      const body = { page_size: limit };
      const notionRes = await notionRequest(`/v1/databases/${dbId}/query`, 'POST', body);
      const leads = notionRes.results.map(mapNotionPage);
      sendJson(res, 200, { results: leads });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/notion/leads') {
      const payload = await parseBody(req);
      const properties = notionPropertiesFromLead(payload);
      const notionBody = {
        parent: { database_id: dbId },
        properties,
      };
      const notionRes = await notionRequest('/v1/pages', 'POST', notionBody);
      sendJson(res, 200, { page: notionRes });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/notion/ping') {
      sendJson(res, 200, { status: 'ok', database: dbId });
      return;
    }

    sendJson(res, 404, { error: 'Not implemented' });
  } catch (err) {
    console.error('Notion proxy error', err);
    if (err.status) {
      sendJson(res, err.status, { error: err.body || 'Notion API error' });
    } else {
      sendJson(res, 500, { error: err.message || 'Unknown error' });
    }
  }
});

server.listen(port, () => {
  console.log(`Notion proxy server running on http://localhost:${port}`);
});
