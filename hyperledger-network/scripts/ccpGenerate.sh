#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${ORG_CAPS}/$6/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        scripts/ccp-template.json
}

function yaml_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${ORG_CAPS}/$6/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        scripts/ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
}

ORG=uis
ORG_CAPS=UiS
P0PORT=7051
CAPORT=7054
PEERPEM=${PWD}/crypto-config/peerOrganizations/$ORG.example.com/tlsca/tlsca.$ORG.example.com-cert.pem
CAPEM=${PWD}/crypto-config/peerOrganizations/$ORG.example.com/ca/ca.$ORG.example.com-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $ORG_CAPS)" > ${PWD}/crypto-config/peerOrganizations/$ORG.example.com/connection-$ORG.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $ORG_CAPS)" > ${PWD}/crypto-config/peerOrganizations/$ORG.example.com/connection-$ORG.yaml

ORG=uib
ORG_CAPS=UiB
P0PORT=8051
CAPORT=8054
PEERPEM=${PWD}/crypto-config/peerOrganizations/$ORG.example.com/tlsca/tlsca.$ORG.example.com-cert.pem
CAPEM=${PWD}/crypto-config/peerOrganizations/$ORG.example.com/ca/ca.$ORG.example.com-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $ORG_CAPS)" > ${PWD}/crypto-config/peerOrganizations/$ORG.example.com/connection-$ORG.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $ORG_CAPS)" > ${PWD}/crypto-config/peerOrganizations/$ORG.example.com/connection-$ORG.yaml

ORG=uio
ORG_CAPS=UiO
P0PORT=9051
CAPORT=9054
PEERPEM=${PWD}/crypto-config/peerOrganizations/$ORG.example.com/tlsca/tlsca.$ORG.example.com-cert.pem
CAPEM=${PWD}/crypto-config/peerOrganizations/$ORG.example.com/ca/ca.$ORG.example.com-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $ORG_CAPS)" > ${PWD}/crypto-config/peerOrganizations/$ORG.example.com/connection-$ORG.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $ORG_CAPS)" > ${PWD}/crypto-config/peerOrganizations/$ORG.example.com/connection-$ORG.yaml
