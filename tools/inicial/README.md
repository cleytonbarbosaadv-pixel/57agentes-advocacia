# gerar_inicial.py — inicial de contrato migrado (consignado INSS)

    python gerar_inicial.py casos/<cliente>_<banco>.json -o "<pasta da cliente>/INICIAL_....docx"

1. Copie `casos/ercilia_novo_banco_continental.json` e preencha com os dados do HISCON/análise. Campo vazio = trecho em VERMELHO no Word.
2. `contrato.status`: `ativo` (tutela de urgência + exclusão da averbação) ou `excluido` (campo "Motivo da Exclusão").
3. `parcelas_descontadas`: null = estima pelas datas (`primeiro_desconto`, `data_extrato`) e marca em vermelho.
4. O script avisa se alguma âncora do modelo não for achada ou se sobrar texto do caso antigo.
5. Validar (`validate.py` da skill docx, com `PYTHONIOENCODING=utf-8`), conferir no Word e subir na pasta da cliente no Drive (Chrome: Novo > Upload de arquivo > file_upload).

Modelo: `modelo_migrado.docx` (cópia do "INICIAL_MIGRADO_EXCLUIDO_2novo modelo"). Se o modelo mudar, troque o arquivo e ajuste as âncoras (texto inicial dos parágrafos) em `montar()`.
