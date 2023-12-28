cd dist/wordle/
zip a -r ../../wordle.zip *
cd ../../
aws s3 cp wordle.zip s3://app-staging-jsr/wordle/
