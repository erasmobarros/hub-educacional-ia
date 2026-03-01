# Usa uma imagem leve do Python 3.10
FROM python:3.10-slim

# Define o diretório de trabalho dentro do container
WORKDIR /code

# Copia o arquivo de dependências primeiro (para aproveitar o cache do Docker)
COPY ./requirements.txt /code/requirements.txt

# Instala as dependências
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copia o restante do seu código para dentro do container
COPY ./app /code/app

# Comando para rodar a aplicação quando o container iniciar
# O "host 0.0.0.0" é essencial para o Docker expor a porta para fora
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]